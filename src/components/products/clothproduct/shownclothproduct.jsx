import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase/db.js";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { TbCurrencyNaira } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { MdDelete, MdOutlineError } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

function Showclothproduct(){
   const [isLoading, setIsLoading] = useState(false);
   const [filterclothproduct, setFliteredClothProduct] = useState([]);
   const [allClothProducts, setAllClothProducts] = useState([]);
   const [searchInput, setSearchInput] = useState("")
   const [currentPage, setCurrentPage] = useState(1);
   const { setResponseMessage } = useOutletContext();

   const fetchClothProduct =  () => {
      setIsLoading(true);
      
      const getProductRef = collection(db, "clothproductDB");
      const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
         const products = snapshot.docs.map(doc =>({
               id: doc.id, ...doc.data(),
         }));
         setFliteredClothProduct(products);
         setAllClothProducts(products);
         console.log(products);
         setIsLoading(false)
      },(error) => {
         setResponseMessage(`Error occured: ${error.message}`);
         console.error(error);
         setIsLoading(false)
      })
      return productSnapShot
   }

   useEffect(() => {
      const getProduct = fetchClothProduct()
      return () => {
         getProduct();
      }
   },[]);

   useEffect(() => {
      if(searchInput.trim()){
         const filterResult = allClothProducts.filter(item => item.productName?.toLowerCase().includes(searchInput.toLowerCase()) || String(item.productPrice).toLowerCase().includes(searchInput.toLowerCase()) || item.productDescription?.toLowerCase().includes(searchInput.toLowerCase()));

         setFliteredClothProduct(filterResult);
         setCurrentPage(1)
      }else{
         setFliteredClothProduct(allClothProducts);
      }
   },[searchInput, allClothProducts]);

   const paginatedPage = filterclothproduct.slice((currentPage - 1) * 12, currentPage * 12)
   const totalPages = Math.ceil(filterclothproduct.length / 12);

   return(<>
      <div className="w-full my-4 flex items-center justify-between">
         <div className="w-[400px] h-auto">
            <h3 className="font-[mulish] text-lg font-semibold text-gray-700 tracking-wide">Show Available Product</h3>
            <p className="font-[mulish] text-sm font-light text-gray-500 tracking-wide">Here you can view all available products and take actions such as editing, deleting, or viewing details of each product. <strong className="font-semibold"><em> Product affected by actions will be publicly to the linked website.</em></strong></p>
         </div>
         <div className=" w-[400px] h-[44px] bg-[#f1f1f1] inset-ring-2 inset-ring-white rounded-full flex items-center justify-between">
            <IoSearch className="ml-4" color="gray" size={20}/>
            <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name, price & details" className="w-full h-full rounded-full px-3 text-sm font-[mulish] border-none outline-none"/>
         </div>
      </div>
      <div>
         <div>

            {isLoading ? (
               <div className="w-full h-auto">
               <div className="flex items-center justify-center flex-col w-[900px] h-[300px]">
                  <div className="relative">
                  <div className="relative w-20 h-20">
                     <div className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-r-[#0000ff] border-b-[#000] animate-spin" style={{animationDuration: '3s'}} />
                     <div className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-t-[#ff0000] animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#000]/20 via-transparent to-[#ff0000]/20 animate-pulse rounded-full blur-sm" />
                  </div>
               <p className="text-center mt-2 text-md font-medium fomt[mulish] text-gray-500">Generating avaliable product....</p>
               </div>
            </div>
            ) : allClothProducts.length === 0 ? (
               <div className="bg-amber-100 w-full h-[44px] flex items-center justify-between my-15 rounded">
                  <p className="w-[8px] h-full bg-red-600 p-1"></p>
                  <p className="text-red-500 text-md font-semibold font-[mulish] text-center flex items-center justify-center gap-2 py-3 w-full rounded-md">
                     <MdOutlineError />
                     No cloth available right now. Try adding a new one!
                  </p>
               </div>
            ) : searchInput.trim() && filterclothproduct.length === 0 ? (
               <div className="bg-amber-100 w-full h-[44px] flex items-center justify-between my-15 rounded">
                  <p className="w-[8px] h-full bg-red-600 p-1"></p>
                  <p className="text-red-500 text-md font-semibold font-[mulish] text-center flex items-center justify-center gap-2 py-3 w-full rounded-md">
                     <MdOutlineError />
                     No result found for your search. try searching for another type!
                  </p>
               </div>
            ) : (<div className="w-full h-auto flex flex-wrap gap-2 justify-start">{
               paginatedPage.map((product) => (
                  <div key={product.id} className="bg-[#F5F2F2] rounded-3xl w-[210px] h-auto py-2 mt-3">
                     <div className="w-[200px] h-[150px] mx-auto">
                        <img src={product.productImage} alt="product images" className="w-full h-full object-cover rounded-3xl"/>
                     </div>
                        
                     <div className="mt-1 p-2">
                        <p className="text-gray-600 capitalize text-sm font-semibold font-[mulish] tracking-wide">{product.productName}</p>
                        <p className="text-gray-500 text-[13px] font-extralight font-[mulish] tracking-wide">{product.productDescription.slice(0, 20)}</p>
                     </div>

                     <div className="px-3 flex items-center justify-between">
                        <p className="flex items-center text-sm text-gray-600 font-medium tracking-wide font-[mulish]"><TbCurrencyNaira size={20}/>{product.productPrice}</p>
                        <div className="flex items-center gap-3">
                           <BiEdit className="bg-white p-0.5 rounded shadow cursor-pointer" size={20}/>
                           <MdDelete className="bg-red-600 p-0.5 rounded shadow cursor-pointer" size={20} color="white"/>
                           <button className="bg-blue-600 text-sm text-white p-0.5 rounded shadow cursor-pointer" size={20}>Details</button>
                        </div>
                     </div>
                  </div>
               ))
            }</div>)}

            <div className="mt-3 flex items-center justify-between px-3 py-4 bg-white rounded shadow">
               <div>
                  <p className="font-semibold font-[mulish] text-gray-500 text-sm">Page {currentPage} of {totalPages}</p>
               </div>
               <div className="flex items-center gap-5">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className={`rounded p-1 shadow ${currentPage === 1 ? " bg-zinc-100 cursor-auto" : "bg-white cursor-pointer"}`}><IoIosArrowBack size={20} color="gray"/></button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className={`rounded p-1 shadow ${currentPage === totalPages ? " bg-zinc-100 cursor-auto" : "bg-white cursor-pointer"}`}><IoIosArrowForward size={20} color="gray"/></button>
               </div>
            </div>
         
         </div>
      </div>
   </>);
}

export default Showclothproduct