import loadingSvg from "./loading.svg";

const Spinner = ({ size = 48, fullPage = false }) => {
    if (fullPage) {
        return (
            <div className="spinner-fullpage">
                <img src={loadingSvg} alt="Loading..." width={size} height={size} className="spinner-img" />
            </div>
        );
    }
    return <img src={loadingSvg} alt="Loading..." width={size} height={size} className="spinner-img" />;
};

export default Spinner;
