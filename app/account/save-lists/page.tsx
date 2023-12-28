// import ProductCard from "components/ProductCard";
// import { PRODUCTS } from "data/data";
// import ButtonSecondary from "shared/Button/ButtonSecondary";
"use client";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import ProductCard from "@/app/components/ProductCard3";

const AccountSavelists = () => {
    const renderSection1 = () => {
        return (
            <div className="space-y-10 sm:space-y-12">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-semibold">
                        List of saved products
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 ">

                </div>
                <div className="flex !mt-20 justify-center items-center">
                    <ButtonSecondary loading>Show me more</ButtonSecondary>
                </div>
            </div>
        );
    };

    return (
        <div>
            {renderSection1()}
        </div>
    );
};

export default AccountSavelists;
