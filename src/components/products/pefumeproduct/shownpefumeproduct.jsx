import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase/db.js";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { TbCurrencyNaira } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { MdDelete, MdOutlineError } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowForward, IoIosArrowBack,IoIosArrowRoundBack } from "react-icons/io";
import { IoClose } from "react-icons/io5";


function showPerfumeProduct(){
   const [isLoading, setIsLoading] = useState(false);
   const [filterPefumeproduct, setFliteredPefumeProduct] = useState([]);
   const [allPefumeProducts, setAllPefumeProducts] = useState([]);
   const [searchInput, setSearchInput] = useState("")
   const [currentPage, setCurrentPage] = useState(1);
   const { setResponseMessage } = useOutletContext();
   const [editingModal, setEditingModal] = useState(false)
   const [selectedPefumeProduct, setSelectedPefumeProduct] = useState(null)
   const [updateProductName, setUpdateProductName] = useState("")
   const [updateProductDetail, setUpdateProductDetail] = useState("")
   const [updateProductPrice, setUpdateProductPrice] = useState("")
   const [updateProductImage, setUpdateProductImage] = useState("")
   const [imagePreview, setImagePreview] = useState("");
   const [detailModal, setDetailModal] = useState(false);

   const fetchClothProduct =  () => {
      setIsLoading(true);
      
      const getProductRef = collection(db, "perfumeproductDB");
      const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
         const products = snapshot.docs.map(doc =>({
               id: doc.id, ...doc.data(),
         }));
         setFliteredPefumeProduct(products);
         setAllPefumeProducts(products);
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
         const filterResult = allPefumeProducts.filter(item => item.productName?.toLowerCase().includes(searchInput.toLowerCase()) || String(item.productPrice).toLowerCase().includes(searchInput.toLowerCase()) || item.productDescription?.toLowerCase().includes(searchInput.toLowerCase()));

         setFliteredPefumeProduct(filterResult);
         setCurrentPage(1)
      }else{
         setFliteredPefumeProduct(allPefumeProducts);
      }
   },[searchInput, allPefumeProducts]);

   const paginatedPage = filterPefumeproduct.slice((currentPage - 1) * 12, currentPage * 12)
   const totalPages = Math.ceil(filterPefumeproduct.length / 12);



   const handleEditProduct = (product) =>{
      setSelectedPefumeProduct(product)
      setUpdateProductName(product.productName || "");
      setUpdateProductDetail(product.productDescription || "");
      setUpdateProductPrice(product.productPrice || "");
      setUpdateProductImage(product.productImage || "");
      setImagePreview(product.productImage || "");
   }
   
   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setImagePreview(URL.createObjectURL(file));
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onloadend = () => {
            setUpdateProductImage(reader.result); // store base64
         };
      }
   };

   const handleUpdateProduct = async (e) => {
      e.preventDefault();
      if (!updateProductName.trim() || !updateProductPrice.trim()) {
         setResponseMessage("Name and Price are required");
         return;
      }
      setIsLoading(true)
      try {
         const productRef = doc(db, "perfumeproductDB", selectedPefumeProduct.id);
         await updateDoc(productRef, {
            productName: updateProductName,
            productPrice: updateProductPrice,
            productDescription: updateProductDetail,
            productImage: updateProductImage, // updated if new image uploaded
         });

         setResponseMessage("Product updated successfully ✅");
         setEditingModal(false);
      } catch (error) {
         setResponseMessage(`Error updating product: ${error.message}`);
         setIsLoading(false)
      }finally{
         setIsLoading(false)
      }
   };

   const handleDelete = async (productId) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this product?");
      if (!confirmDelete) return;

      try {
         await deleteDoc(doc(db, "perfumeproductDB", productId));
         alert("Product deleted successfully ✅");
      } catch (error) {
         console.error("Error deleting product:", error);
         alert("Failed to delete product ❌");
      }
   };

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
            ) : allPefumeProducts.length === 0 ? (
               <div className="bg-amber-100 w-full h-[44px] flex items-center justify-between my-15 rounded">
                  <p className="w-[8px] h-full bg-red-600 p-1"></p>
                  <p className="text-red-500 text-md font-semibold font-[mulish] text-center flex items-center justify-center gap-2 py-3 w-full rounded-md">
                     <MdOutlineError />
                     No pefume available right now. Try adding a new one!
                  </p>
               </div>
            ) : searchInput.trim() && filterPefumeproduct.length === 0 ? (
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
                        <p className="text-gray-500 text-[13px] font-extralight font-[mulish] tracking-wide">{product.productDescription.slice(0, 50)}....</p>
                     </div>

                     <div className="px-3 flex items-center justify-between">
                        <p className="flex items-center text-sm text-gray-600 font-medium tracking-wide font-[mulish]"><TbCurrencyNaira size={20}/>{Number(product.productPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        <div className="flex items-center justify-end gap-1">
                           <BiEdit onClick={()=> {setEditingModal(true); handleEditProduct(product)}} className="bg-white p-0.5 rounded shadow cursor-pointer" size={20}/>
                           <MdDelete onClick={()=> handleDelete(product.id)} className="bg-red-600 p-0.5 rounded shadow cursor-pointer" size={20} color="white"/>
                           <button onClick={()=> {setDetailModal(true); handleEditProduct(product)}} className="bg-blue-600 text-xs text-white p-0.5 rounded shadow cursor-pointer" size={20}>Details</button>
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

      
      {/* Edit modal */}
      <div className={`w-full h-screen bg-[#000000ab] fixed top-0 z-50 transition-all duration-300 ${editingModal ? "right-0" : "right-[-100%]"}`}>
         {editingModal && selectedPefumeProduct && (
         <div className="w-[40%] h-screen bg-white absolute right-0 z-60 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-white shadow sticky top-0">
               <h3 className="capitalize font-[mulish] text-lg tracking-wide font-semibold text-blue-600">#Editing {selectedPefumeProduct.productName}</h3>
               <IoClose onClick={()=> setEditingModal(false)} size={20} className="w-[30px] h-[30px] text-red-600 bg-white shadow rounded-md cursor-pointer"/>
            </div>
               <div className="p-4">
               <div>
                  <p className="text-xl font-[mulish] font-semibold text-blue-600">Editing...</p>
               </div>
               <form onSubmit={handleUpdateProduct}>
                  <div className="flex items-start flex-col gap-1 w-full mt-5">
                     <label htmlFor="productName" className="text-sm font-[mulish] tracking-wide">Product Name</label>
                     <input type="text" value={updateProductName} onChange={(e)=> setUpdateProductName(e.target.value)} className="w-full h-[40px] border-2 border-gray-300 rounded-md text-base font-[mulish] capitalize px-2 focus:border-blue-600 outline-none"/>
                  </div>

                  <div className="flex items-start flex-col gap-1 w-full mt-5">
                     <label htmlFor="productPrice" className="text-sm font-[mulish] tracking-wide">Product Price</label>
                     <input type="text" value={updateProductPrice} onChange={(e)=> setUpdateProductPrice(e.target.value)} className="w-full h-[40px] border-2 border-gray-300 rounded-md text-base font-[mulish] capitalize px-2 focus:border-blue-600 outline-none"/>
                  </div>

                  <div className="flex items-start flex-col gap-1 w-full h-auto mt-5">
                     <label htmlFor="productName" className="text-sm font-[mulish] tracking-wide">Product Details</label>
                     <div className="w-full h-[150px]">
                        <textarea value={updateProductDetail} onChange={(e)=> setUpdateProductDetail(e.target.value)} className="w-full h-full border-2 border-gray-300 rounded-md text-base font-[mulish] capitalize p-2 focus:border-blue-600 outline-none resize-none"></textarea>
                     </div>
                  </div>

                  <div className="flex items-start flex-col gap-1 w-full mt-5">
                     <label htmlFor="productImage" className="text-sm font-[mulish] tracking-wide">Select Product Image</label>
                     <input type="file" onChange={handleFileChange} className="w-full h-[40px] border-2 border-gray-300 rounded-md text-base font-[mulish] capitalize px-2 pt-2 focus:border-blue-600 outline-none"/>
                  {/* image preview */}
                  <div className="w-[150px] h-[150px] border my-3">
                     {imagePreview && (
                        <img src={imagePreview} className="w-full h-full object-cover"/>
                     )}
                  </div>
                  </div>
                  <button disabled={isLoading} className={`w-full h-[44px] my-3 bg-blue-600 text-white rounded-md ${isLoading ? "cursor-not-allowed bg-blue-400" : "cursor-pointer"}`}>{isLoading ? "Loading......" : "Update"}</button>
               </form>
               </div>
         </div>
         )}
      </div>

      
      
      {/* modal for details */}
      
      <div className={`w-full h-screen bg-[#000000ab] fixed top-0 z-50 transition-all duration-300  ${detailModal ? "right-0" : "right-[-100%]"}`}>
            {detailModal && selectedPefumeProduct &&(
            <div className="w-full h-screen flex items-center justify-center">
               <div className="w-[1200px] h-[550px] bg-white rounded-md overflow-y-auto">
                  <div className="w-full h-[40px] py-3 pl-15">
                     <div onClick={()=>setDetailModal(false)} className="flex items-center cursor-pointer">
                        <IoIosArrowRoundBack size={25} className="text-red-900"/>
                        <span className="font-[mulish] text-base font-semibold text-red-900 ">Back</span>
                     </div>
                  </div>
                  <div className="flex items-center justify-around mt-10">
                     <div className="w-[40%] h-[400px]">
                        <img src={selectedPefumeProduct.productImage} alt={selectedPefumeProduct.productName} className="w-full h-full object-cover"/>
                     </div>
                     <div className="w-[40%]">
                        <h3 className="text-2xl uppercase font-[mulish] font-semibold text-gray-600 tracking-wide">{selectedPefumeProduct.productName}</h3>
                        <p className="flex items-center my-3 text-xl font-[mulish] font-bold">Price: <TbCurrencyNaira size={20}/> {Number(selectedPefumeProduct.productPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <div className="w-full p-1 h-[300px] overflow-hidden">
                           <p className="text-base font-[lato] leading-[25px] w-full h-full overflow-y-auto tracking-wide custom-scrollbar">{selectedPefumeProduct.productDescription || "No product description"}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            )}
      </div>
   </>);
}

export default showPerfumeProduct