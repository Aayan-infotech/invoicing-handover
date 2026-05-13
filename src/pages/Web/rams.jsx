import React from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { images } from "../../contstants";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import ProgressBar from "react-bootstrap/ProgressBar";

const Rams = () => {
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = React.useState(true);
  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2 className="d-inline" style={{ minWidth: "240px" }}>
            RAMS
          </h2>
         
        </div>

        <div className="mt-4">
          <h4 className="">Lorem Ipsum</h4>
          <div className="d-flex flex-column gap-3 mt-3 data-max">
            <p>
              Jorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
              turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus
              nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum
              tellus elit sed risus. Maecenas eget condimentum velit, sit amet
              feugiat lectus. Class aptent taciti sociosqu ad litora torquent
              per conubia nostra, per inceptos himenaeos. Praesent auctor purus
              luctus enim egestas, ac scelerisque ante pulvinar. Donec ut
              rhoncus ex. Suspendisse ac rhoncus nisl, eu tempor urna. Curabitur
              vel bibendum lorem. Morbi convallis convallis diam sit amet
              lacinia. Aliquam in elementum tellus.
            </p>
            <p>
              Curabitur tempor quis eros tempus lacinia. Nam bibendum
              pellentesque quam a convallis. Sed ut vulputate nisi. Integer in
              felis sed leo vestibulum venenatis. Suspendisse quis arcu sem.
              Aenean feugiat ex eu vestibulum vestibulum. Morbi a eleifend
              magna. Nam metus lacus, porttitor eu mauris a, blandit ultrices
              nibh. Mauris sit amet magna non ligula vestibulum eleifend. Nulla
              varius volutpat turpis sed lacinia. Nam eget mi in purus lobortis
              eleifend. Sed nec ante dictum sem condimentum ullamcorper quis
              venenatis nisi. Proin vitae facilisis nisi, ac posuere leo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rams;
