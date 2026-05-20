// 공통 기능. 로그인 상태 확인, 공통 메뉴 처리, 페이지 이동

// 1. 네비게이션 파일(nav.html) 통째로 불러와서 #header에 넣기
$('#header').load('../component/nav.html');

// 2. .navbar-toggle 누르면 열고 닫기
$(document).on('click', '.navbar-toggle', function() {
    var target = $(this).attr('data-target'); // '#myNavbar' 글자 가져오기
    $(target).collapse('toggle');            // 메뉴창 열고 닫기 끝!
});

    fetch('../component/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    });