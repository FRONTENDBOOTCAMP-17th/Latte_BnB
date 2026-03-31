# Toast 모듈 사용 안내

## 함수 목록
`message(message, details = '', duration = 2);`   
`success(message, details = '', duration = 2);`   
`warn(message, details = '', duration = 2);`   

- 3개의 함수 모두 message 인자는 필수로 작성해야한다.
- details, duration은 선택사항이다.

## 사용 방법
1. components/ 폴더에 있는 toast.js 파일을 import 한다.   
    -> ex: `import toast from ../../src/components/toast.js`

2. toast.message, toast.success, toast.warn 함수를 호출한다.   
    -> ex.1: `toast.message('안녕하세요');`   
    -> ex.2: `toast.message('Greeting', '안녕하세요~');`   
    -> ex.3: `toast.message('Greeting', '안녕하세요~~', 5);`   
    - message 부분을 success, warn으로 변경하여 사용가능
    - success는 초록색 테마의 토스트, warn은 빨간색 테마의 토스트

## 커스텀 방법
토스트가 뜨는 위치를 변경하고 싶거나 토스트 바디의 색상, 내부 글씨 색상을 변경하고 싶다면,
다음의 과정대로 사용하면 된다.

1. 사용하고자 하는 html파일의 body태그 내부 아무데나 `<div id="toast"></div>`를 추가한다.
2. 해당 태그에 `tailwindcss 유틸리티 클래스`로 위치를 옮기거나, 해당 html에서 사용하는 `스타일시트`에 `#toast`에 대한 스타일을 작성하면 된다. (토스트 바디에 해당하는 부분)
3. message의 글씨 스타일, details의 글씨 스타일을 지정하고 싶다면, 스타일시트에서 `#toastMessage, #toastDetail`에 대한 스타일을 작성하면 된다.
4. tailwindcss의 유틸리티 클래스를 사용해서 글씨 스타일을 변경하고 싶을 땐 다음의 과정을 따르면 된다.
5. `<div id="toast"></div>` 내부에 id가 toastMessage, toastDetail인 요소를 추가하면 된다. (태그 상관 x) ex) `<p id="toastMessage"></p>`, `<span id="toastDetail"></span>`
6. 추가한 태그에 유틸리티 클래스를 작성해서 스타일링하면 된다.

문서를 보고 해봐도 잘 안된다면 `이선우`에게 연락주세요.