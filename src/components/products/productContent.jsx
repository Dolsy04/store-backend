import { useState } from "react";
import ShoeProducts from "./shoeproducts.jsx"
import ClothProducts from "./clothproducts.jsx";
import PefumeProducts from "./pefumeproduct.jsx";
function ProductsContent(){
    const productNav = [
        {id: 1, title: "Cloth products", component: <ClothProducts />},
        {id: 2, title: "Shoe products",component: <ShoeProducts/>},
        {id: 3, title: "Pefume products", component: <PefumeProducts />}
    ]

    const [selectedProduct, setSelectedProduct] = useState(productNav[0]);

    return(<>
        <section className="">
            <h3 className="font-semibold font-[mulish] text-xl uppercase">Products</h3>

            <div className="mt-3">
                <div className="flex items-center gap-[20px] bg-[#d1d4fd] rounded-md">
                    {productNav.map((nav) => (
                        <div key={nav.id} className="p-1">
                            <button onClick={() => setSelectedProduct(nav)} className={`px-4 py-2 cursor-pointer font-[mulish] font-medium tracking-wide rounded-md transition-all ${selectedProduct.id === nav.id ? "bg-blue-300 text-blue-700 font-semibold": "text-gray-600 hover:bg-gray-200"}`}>{nav.title}</button>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section>
            {/* display each product content */}
            {selectedProduct.component}
        </section>
    </>);
}

export default ProductsContent;