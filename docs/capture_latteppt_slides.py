from __future__ import annotations

import argparse
import base64
import os
import re
import subprocess
import sys
from pathlib import Path


POWERSHELL_EXPORT_SCRIPT = r"""
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
[void][Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
[void][Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapEncoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]

$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object {
        $_.Name -eq 'AsTask' -and
        $_.IsGenericMethodDefinition -and
        $_.GetGenericArguments().Count -eq 1 -and
        $_.GetParameters().Count -eq 1 -and
        $_.GetParameters()[0].ParameterType.Name -like 'IAsyncOperation*'
    } |
    Select-Object -First 1

$asTaskAction = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object {
        $_.Name -eq 'AsTask' -and
        -not $_.IsGenericMethod -and
        $_.GetParameters().Count -eq 1 -and
        $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction'
    } |
    Select-Object -First 1

function Await([object] $operation, [type] $resultType) {
    $task = $asTaskGeneric.MakeGenericMethod($resultType).Invoke($null, @($operation))
    return $task.GetAwaiter().GetResult()
}

function AwaitAction([object] $action) {
    $task = $asTaskAction.Invoke($null, @($action))
    $task.GetAwaiter().GetResult()
}

$pdfPath = $env:LATTE_PDF_PATH
$outputDir = $env:LATTE_OUTPUT_DIR

if (-not (Test-Path -LiteralPath $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath)) ([Windows.Storage.StorageFile])
$document = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
$digits = [Math]::Max(2, $document.PageCount.ToString().Length)

Write-Output ("pages=" + $document.PageCount)

for ($pageIndex = 0; $pageIndex -lt $document.PageCount; $pageIndex++) {
    $page = $document.GetPage($pageIndex)
    $stream = [Windows.Storage.Streams.InMemoryRandomAccessStream]::new()
    $fileStream = $null
    $outputStream = $null

    try {
        AwaitAction ($page.RenderToStreamAsync($stream))

        $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
        $fileName = "slide_{0}.png" -f (($pageIndex + 1).ToString().PadLeft($digits, '0'))
        $targetPath = Join-Path $outputDir $fileName

        if (Test-Path -LiteralPath $targetPath) {
            Remove-Item -LiteralPath $targetPath -Force
        }

        $fileStream = [System.IO.File]::Open(
            $targetPath,
            [System.IO.FileMode]::Create,
            [System.IO.FileAccess]::ReadWrite,
            [System.IO.FileShare]::None
        )
        $outputStream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($fileStream)
        $encoder = Await (
            [Windows.Graphics.Imaging.BitmapEncoder]::CreateForTranscodingAsync($outputStream, $decoder)
        ) ([Windows.Graphics.Imaging.BitmapEncoder])

        AwaitAction ($encoder.FlushAsync())
        Write-Output ("saved=" + $targetPath)
    }
    finally {
        if ($outputStream) {
            $outputStream.Dispose()
        }
        if ($fileStream) {
            $fileStream.Dispose()
        }
        if ($stream) {
            $stream.Dispose()
        }
        if ($page) {
            $page.Dispose()
        }
    }
}
"""


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Render each page of a PDF deck into PNG slide images on Windows."
    )
    parser.add_argument(
        "--pdf",
        default="docs/latteppt.pdf",
        type=Path,
        help="Path to the source PDF file.",
    )
    parser.add_argument(
        "--output-dir",
        default="docs/ppt_screenshot",
        type=Path,
        help="Directory where rendered slide images will be written.",
    )
    return parser


def encode_powershell_script(script: str) -> str:
    return base64.b64encode(script.encode("utf-16le")).decode("ascii")


def clean_existing_outputs(output_dir: Path) -> None:
    for path in output_dir.glob("slide_*.png"):
        path.unlink()


def run_export(pdf_path: Path, output_dir: Path) -> tuple[int, list[Path]]:
    env = os.environ.copy()
    env["LATTE_PDF_PATH"] = str(pdf_path)
    env["LATTE_OUTPUT_DIR"] = str(output_dir)

    completed = subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-EncodedCommand",
            encode_powershell_script(POWERSHELL_EXPORT_SCRIPT),
        ],
        capture_output=True,
        text=True,
        env=env,
        check=False,
    )

    if completed.returncode != 0:
        raise RuntimeError(
            "Slide export failed.\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )

    match = re.search(r"^pages=(\d+)$", completed.stdout, re.MULTILINE)
    if not match:
        raise RuntimeError(
            "Could not determine page count from the exporter output.\n"
            f"stdout:\n{completed.stdout}"
        )

    page_count = int(match.group(1))
    images = sorted(output_dir.glob("slide_*.png"))
    return page_count, images


def main() -> int:
    if os.name != "nt":
        print("This script uses the Windows PDF renderer and must run on Windows.", file=sys.stderr)
        return 1

    parser = build_argument_parser()
    args = parser.parse_args()

    pdf_path = args.pdf.resolve()
    output_dir = args.output_dir.resolve()

    if not pdf_path.is_file():
        print(f"PDF file not found: {pdf_path}", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)
    clean_existing_outputs(output_dir)

    try:
        page_count, images = run_export(pdf_path, output_dir)
    except Exception as exc:  # pragma: no cover - runtime integration guard
        print(str(exc), file=sys.stderr)
        return 1

    if len(images) != page_count:
        print(
            f"Expected {page_count} rendered slides, but found {len(images)} files in {output_dir}.",
            file=sys.stderr,
        )
        return 1

    first_image = images[0].name if images else "N/A"
    last_image = images[-1].name if images else "N/A"
    print(f"Exported {len(images)} slides to {output_dir}")
    print(f"First file: {first_image}")
    print(f"Last file: {last_image}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
