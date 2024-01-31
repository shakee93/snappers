import ProductSpecifications from "./ProductSpecifications";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import parseHtml from 'html-react-parser'

const ProductOverview = ({
  product,
}: {
  product: SimpleProduct | VariableProduct
}) => {

  const manualMeta = product?.metaData;
  const techSpecDataObject = manualMeta?.find(item => item?.key === 'tech_spec_data');
  const parsedMetaData = techSpecDataObject?.value ? JSON.parse(techSpecDataObject.value) : null;
  const manualTechSpecs = parsedMetaData ? Object.entries(parsedMetaData) : [];

  const techValue = product.metaData?.find(meta => meta?.key === 'tech_spec')?.value;
  const techSpecs = JSON.parse(techValue || 'false')

  return (
    <>
      <div className="bg-white p-5 rounded-3xl md:p-10 my-5">
        <div className="pb-3 border-b-2 border-gray-200">
          <h3 className="text-lg md:text-xl">Overview</h3>
        </div>
        <div className="flex flex-col md:flex-row py-2 md:py-5">
          <div className="md:w-3/5 p-2 md:p-4">

            <div className="text-xs md:text-sm text-gray-600">
              {parseHtml(product.description || '')}
            </div>
          </div>
          <div className="md:w-2/5">
            {(techSpecs && techSpecs.items || manualTechSpecs && manualTechSpecs.length > 0) && (
              <ProductSpecifications techspecs={techSpecs} manualSpecs={manualTechSpecs} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductOverview;
