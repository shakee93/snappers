import ProductSpecifications from "./ProductSpecifications";
import {SimpleProduct, VariableProduct} from "@/graphql/types/graphql";
import parseHtml from 'html-react-parser'

const ProductOverview = ({
    product
                         }:{
  product: SimpleProduct | VariableProduct
}) => {

  return (
    <>
     <div className="bg-white p-5 rounded-3xl md:p-10 my-5">
        <div className="pb-3 border-b-2 border-gray-200">
          <h3 className="text-lg md:text-xl">Overview</h3>
        </div>
        <div className="flex flex-col md:flex-row py-2 md:py-5">
          <div className="md:w-3/5 p-2 md:p-4">


            <div className="text-sm md:text-base py-2">Highlights</div>
            <div>
              <ul className="text-xs md:text-sm flex flex-col gap-1 list-disc pl-4 text-gray-600">
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
            <div className="text-sm md:text-base py-2">Overview</div>
            <div className="text-xs md:text-sm text-gray-600">
              {parseHtml(product.description || '')}
            </div>
          </div>
          <div className="md:w-2/5">
            <ProductSpecifications/>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductOverview;
