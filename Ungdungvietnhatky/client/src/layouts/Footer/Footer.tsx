import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";
import "./Footer.scss";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
      
        <div className="brand">
          <div className="brand__name">MY BLOG</div>
        </div>

        <div className="about">
          <h4>About</h4>
          <strong>Rareblocks</strong>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dictum
            aliquet accumsan porta lectus ridiculus in mattis. Netus sodales in
            volutpat ullamcorper amet adipiscing fermentum.
          </p>
        </div>

        <div className="col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Features</a></li>
            <li><a href="#">Works</a></li>
            <li><a href="#">Career</a></li>
          </ul>
        </div>

        <div className="col">
          <h4>Help</h4>
          <ul>
            <li><a href="#">Customer Support</a></li>
            <li><a href="#">Delivery Details</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Free eBooks</a></li>
            <li><a href="#">Development Tutorial</a></li>
            <li><a href="#">How to - Blog</a></li>
            <li><a href="#">Youtube Playlist</a></li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="socials">
          <a href="#" aria-label="Twitter"><FaTwitter /></a>
          <a href="#" aria-label="Facebook"><FaFacebookF /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
          <a href="#" aria-label="Github"><FaGithub /></a>
        </div>
      </div>
    </footer>
  );
}
