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
  const warrantyType = manualMeta?.find(item => item?.key === 'warranty_type')?.value;
  const warrantyPeriod = manualMeta?.find(item => item?.key === 'warranty_period')?.value;
  const parsedMetaData = techSpecDataObject?.value ? JSON.parse(techSpecDataObject.value) : null;
  const manualTechSpecs = parsedMetaData ? Object.entries(parsedMetaData) : [];

  const techValue = product.metaData?.find(meta => meta?.key === 'tech_spec')?.value;
  const techSpecs = JSON.parse(techValue || 'false')

  function addParagraphSpacing(htmlString: any) {
    const paragraphs = htmlString?.split('</p>');

    const parsedHtml = paragraphs?.map((paragraph: any) => {
      const trimmedParagraph = paragraph?.trim();
      if (trimmedParagraph !== '') {
        return trimmedParagraph + '</p><p>';
      } else {
        return '';
      }
    }).join('');

    const finalHtml = parsedHtml?.slice(0, -('<p>'.length));

    return finalHtml;
  }

  const centerImages = (htmlContent: string) => {
    return htmlContent?.replace(/<img/g, '<img style="display:block; margin:auto;"');
  };

  const formattedDescription = centerImages(addParagraphSpacing(product.description));

  const increaseH1Font = (htmlContent: any) => {
    if (typeof htmlContent !== 'undefined') {
      return htmlContent.replace(/<h1>/g, '<h1 class="text-lg py-2">');
    } else {
      return '';
    }
  };


  return (
    <>
      <div className="bg-white p-5 rounded-3xl md:p-10 my-5 max-w-screen overflow-hidden">
        <div className="pb-3 border-b-2 border-gray-200">
          <h3 className="text-lg md:text-xl">Overview</h3>
        </div>
        <div className="flex flex-col md:flex-row py-2 md:py-5">
          <div className={`${techSpecs && techSpecs.items ? "md:w-3/5" : "md:w-full"} p-2 md:p-4`}>
            <div className="text-xs md:text-sm text-gray-600">
              {parseHtml(increaseH1Font(formattedDescription) || '')}
            </div>
          </div>
          {(techSpecs && techSpecs.items || manualTechSpecs && manualTechSpecs.length > 0) && (
            <div className="md:w-2/5">
              <ProductSpecifications techspecs={techSpecs} manualSpecs={manualTechSpecs} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductOverview;
