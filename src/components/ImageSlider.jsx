import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation"; 
import "./imageslider.css";

import mascot from "../assets/images/human-sketch-logo.svg";
import img2 from "../assets/images/mountain.png";
import img3 from "../assets/images/human-green.png";

function ImageSlider() {
  return (
    <header className="home-header">
      <div className="header-inner">

        {/* 왼쪽: 이미지 슬라이더 */}
        <div className="header-left">
          <Swiper
            modules={[Navigation]}
            navigation
            loop
            slidesPerView={1}
            className="header-swiper"
          >
            <SwiperSlide>
              <img src={mascot} className="header-mascot" />
            </SwiperSlide>

            <SwiperSlide>
              <img src={img2} className="header-mascot" />
            </SwiperSlide>

            <SwiperSlide>
              <img src={img3} className="header-mascot" />
            </SwiperSlide>
          </Swiper>
        </div>

        {/* 오른쪽: 텍스트 */}
        <div className="header-right">
          <h2>
            충북대학교 소프트웨어 학술 동아리
            <br />
            EMSYS에 오신 것을 환영합니다!
          </h2>
        </div>

      </div>
    </header>
  );
}

export default ImageSlider;  