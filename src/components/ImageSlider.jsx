import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import "./imageslider.css";

import mascot from "../assets/images/EMSYS_Halloween.png";
import img2 from "../assets/images/mountain.png";
import img3 from "../assets/images/human-green.png";

function ImageSlider() {
  return (
    <header className="home-header">
      <div className="header-inner">
        {/* 배너 영역 */}
        <div className="header-left">
          {/* 슬라이더 */}
          <Swiper
            modules={[Navigation]}
            navigation={true}
            loop={true}
            slidesPerView={1}
            className="header-swiper"
          >
            <SwiperSlide>
              <img
                src={mascot}
                alt="EMSYS 마스코트"
                className="header-image"
              />
            </SwiperSlide>

            <SwiperSlide>
              <img src={img2} alt="배너 이미지" className="header-image" />
            </SwiperSlide>

            <SwiperSlide>
              <img src={img3} alt="배너 이미지" className="header-image" />
            </SwiperSlide>
          </Swiper>

          {/* 텍스트 */}
          <div className="header-right">
            <h2>
              충북대학교 소프트웨어 학술 동아리
              <br />
              EMSYS에 오신 것을 환영합니다!
            </h2>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ImageSlider;
