import ProductSpecifications from "./ProductSpecifications";


const ProductOverview = () => {
  return (
    <>
     <div className="bg-white p-10 mt-10">
        <div className="pb-3 border-b-2 border-gray-200">
          <h3 className="text-xl">Overview</h3>
        </div>
        <div className="flex py-5">
          <div className="w-3/5 p-4">
            <div className="text-base py-2">Highlights</div>
            <div>
              <ul className="text-sm flex flex-col gap-1 list-disc pl-4 text-gray-600">
                <li>
                  A17 Pro game-changing chip for a groundbreaking performance.
                </li>
                <li>
                  6.1” Super Retina XDR display with ProMotion Technology.
                </li>
                <li>
                  Megapowerful 48MP camera capable for a 3x optical zoom and 15x
                  digital zoom.
                </li>
                <li>Up to 23 hours video playback.</li>
                <li>
                  Facetime is available on the product &amp; would be accessible
                  in regions where facetime is permitted by telecom operators
                </li>
              </ul>
            </div>
            <div className="text-base py-2">Overview</div>
            <div className="text-sm text-gray-600">
              The iPhone 15 Pro features an aerospace‑grade titanium design with
              an all‑new Action button to fast track to your favorite feature.
              The powerful camera system offers multiple focal lengths for
              super‑high‑resolution photos with a new level of detail and color.
            </div>
          </div>
          <div className="w-2/5">
            <ProductSpecifications/>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductOverview;
