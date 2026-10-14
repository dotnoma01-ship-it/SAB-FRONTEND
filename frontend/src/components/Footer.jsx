import { Link } from "react-router-dom";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="sa-footer">
            <div className="sa-container">
                <div className="sa-footer-grid">
                    {/* Company information */}
                    <div className="sa-footer-brand">
                        <Link className="sa-brand" to="/">
                            <span className="sa-brand-mark">S</span>

                            <span>
                                <span className="sa-brand-name">
                                    SOUGHT AFTER
                                </span>

                                <span className="sa-brand-subtitle">
                                    Botaceutical
                                </span>
                            </span>
                        </Link>

                        <p className="sa-footer-about">
                            Exploring the potential of botanical ingredients
                            through responsible sourcing, product knowledge
                            and science-led innovation.
                        </p>
                    </div>

                    {/* Website navigation */}
                    <div>
                        <h4>EXPLORE</h4>

                        <div className="sa-footer-links">
                            <Link to="/">Home</Link>
                            <Link to="/about">About the Company</Link>
                            <Link to="/products">Botanical Products</Link>
                            <Link to="/research">Research &amp; Development</Link>
                        </div>
                    </div>

                    {/* Contact links */}
                    <div>
                        <h4>CONNECT</h4>

                        <div className="sa-footer-links">
                            <Link to="/contact">General Enquiries</Link>
                            <Link to="/contact">Business Partnerships</Link>
                            <Link to="/contact">Contact Our Team</Link>
                        </div>
                    </div>
                </div>

                <div className="sa-footer-bottom">
                    <span>
                        &copy; {currentYear} Sought After Botaceutical.
                        All rights reserved.
                    </span>

                    <span>
                        Botanical knowledge. Thoughtful innovation.
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
