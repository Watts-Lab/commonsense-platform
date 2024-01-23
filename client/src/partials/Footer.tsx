import ReportIssue from "../components/Feedback/ReportIssue";

function Footer() {
  const updateDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    return year;
  };

  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
      <nav className="grid grid-flow-col gap-4">
        <a href="" className="link link-hover">
          About us
        </a>
        <a href="mailto:CSSLab@seas.upenn.edu" className="link link-hover">
          Contact
        </a>
        <a href="https://css.seas.upenn.edu/" className="link link-hover">
          CSSLab
        </a>
        <a href="https://www.seas.upenn.edu/" className="link link-hover">
          Penn Engineering
        </a>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <a href="https://twitter.com/csspenn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 64 64"
            >
              <path d="M57,17.114c-1.32,1.973-2.991,3.707-4.916,5.097c0.018,0.423,0.028,0.847,0.028,1.274c0,13.013-9.902,28.018-28.016,28.018	c-5.562,0-12.81-1.948-15.095-4.423c0.772,0.092,1.556,0.138,2.35,0.138c4.615,0,8.861-1.575,12.23-4.216	c-4.309-0.079-7.946-2.928-9.199-6.84c1.96,0.308,4.447-0.17,4.447-0.17s-7.7-1.322-7.899-9.779c2.226,1.291,4.46,1.231,4.46,1.231	s-4.441-2.734-4.379-8.195c0.037-3.221,1.331-4.953,1.331-4.953c8.414,10.361,20.298,10.29,20.298,10.29s-0.255-1.471-0.255-2.243	c0-5.437,4.408-9.847,9.847-9.847c2.832,0,5.391,1.196,7.187,3.111c2.245-0.443,4.353-1.263,6.255-2.391	c-0.859,3.44-4.329,5.448-4.329,5.448S54.314,18.335,57,17.114z"></path>
            </svg>
          </a>
          <a href="https://www.linkedin.com/company/csslab">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="30"
              height="30"
              viewBox="0 0 64 64"
            >
              <path d="M40.227,12C51.145,12,52,12.854,52,23.773v16.453C52,51.145,51.145,52,40.227,52H23.773C12.855,52,12,51.145,12,40.227	V23.773C12,12.854,12.855,12,23.773,12H40.227z M25.029,43V26.728h-5.057V43H25.029z M22.501,24.401	c1.625,0,2.947-1.322,2.947-2.949c0-1.625-1.322-2.947-2.947-2.947c-1.629,0-2.949,1.32-2.949,2.947S20.87,24.401,22.501,24.401z M44,43v-8.925c0-4.382-0.946-7.752-6.067-7.752c-2.46,0-4.109,1.349-4.785,2.628H33.08v-2.223h-4.851V43h5.054v-8.05	c0-2.122,0.405-4.178,3.036-4.178c2.594,0,2.628,2.427,2.628,4.315V43H44z"></path>
            </svg>
          </a>
        </div>
      </nav>
      <aside>
        <p>3401 Walnut Street Suite 417B, Philadelphia PA, 19104</p>

        <div className="flex items-center space-x-2">
          <span>
            Copyright © 2023 - 2024 - All right reserved by CSS lab at UPenn
          </span>
          <span>|</span>
          <ReportIssue />
        </div>
      </aside>
    </footer>
  );
}

export default Footer;
