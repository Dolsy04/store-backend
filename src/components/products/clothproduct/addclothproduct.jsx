import { FiUploadCloud } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { db } from "../../../firebase/db.js";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useOutletContext } from "react-router-dom";

function AddClothProduct(){
    const [imagePreview, setImagePreview] = useState("");
    const [base64Image, setBase64Image] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { setResponseMessage } = useOutletContext();
    // const [count, setCount] = useState(7);
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file){
            setImagePreview(URL.createObjectURL(file));
        }

        const imageReader = new FileReader();
        imageReader.readAsDataURL(file);
        imageReader.onloadend = () => {
            setBase64Image(imageReader.result);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if(file){
            setImagePreview(URL.createObjectURL(file));
        }
    }

    const handleDrag = (e) => {
        e.preventDefault();
        
        if(e.type === "dragenter" || e.type === "dragover"){
            setDragActive(true);
        }else if(e.type === "dragleave"){
            setDragActive(false);
        }
    }

    const openFileClick = () =>{
        inputRef.current.click();
    }

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const cleanDescription = productDescription.trim();
        const imageStrings = base64Image;

        if(!productName.trim() || !productPrice.trim()  || !base64Image) {
            setResponseMessage("All fields are required, including image");
            return;
        }

        setIsLoading(true);
        const id = productName.toLowerCase().replace(/\s+/g, "-");
        try{
            await setDoc(doc(db, "clothproductDB", id),{
                id: id,
                productName: productName,
                productPrice: productPrice,
                productDescription: cleanDescription,
                productImage: imageStrings,
                createdAt: serverTimestamp(),
            });
            setResponseMessage("Product Added Successfully");
            setProductName("");
            setProductPrice("");
            setProductDescription("");
            setImagePreview(null);
            setBase64Image("");
        }catch (error){
            console.log("Error occured when adding product:",error.message);
            setResponseMessage(`Error occured: ${error.message}`);
        }finally{
            setIsLoading(false);
        }
    }

    
    
    return(<>
        <div className="w-full ">
            <form onSubmit={handleAddProduct} className="w-[300px]">
                <div>
                    <label htmlFor="product-name" className="text-[14px] font-medium font-[mulish] tracking-wide text-gray-600">Product Name</label><br />
                    <input type="text" id="product-name" placeholder="Enter Product Name" value={productName} onChange={(e)=>setProductName(e.target.value)} className="w-full h-[35px] rounded border border-gray-400 px-2 font-[mulish] text-gray-700 tracking-wide text-base outline-1 outline-none" />
                </div>

                <div className="mt-[20px]">
                    <label htmlFor="product-price" className="text-[14px] font-medium font-[mulish] tracking-wide text-gray-600">Product Price</label><br />
                    <input type="number" id="product-price" placeholder="Enter Product Price" value={productPrice} onChange={(e) =>setProductPrice(e.target.value)} className="w-full h-[35px] rounded  border border-gray-400 px-2 font-[mulish] text-gray-700 tracking-wide text-base outline-1 outline-none" />
                </div>

                <div className="mt-[20px]">
                    <label htmlFor="product-image" className="block text-[14px] font-medium font-[mulish] tracking-wide text-gray-600 mb-2">Upload Product Image</label>

                    <div onClick={openFileClick} onDrop={handleDrop} onDragOver={handleDrag} onDragEnter={handleDrag} onDragLeave={handleDrag} className={`w-full h-[150px] border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer transition duration-300 ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}>
                         {imagePreview ? (
                            <div className="h-full w-full">
                                <img src={imagePreview} alt="Preview product image" className="w-[150] h-full  object-cover rounded shadow"/>
                            </div>
                         ) : (
                            <div className="text-center">
                                 <FiUploadCloud className="text-2xl text-gray-500 mb-2" />
                        <p className="text-gray-600 text-sm font-[mulish]">Drag & drop or click to upload</p>
                            </div>
                         )}
                         <input type="file" accept="image/*" ref={inputRef} onChange={handleFileChange} className="hidden"/> 
                    </div>
                    <div className="mt-[20px]">
                        <span onClick={openFileClick} className="bg-green-700 py-3 px-6 font-[mulish] text-sm cursor-pointer text-white rounded shadow">Upload Image</span>
                        
                        <span onClick={() => {setImagePreview(null);}} className="mt-[10px] ml-3 bg-red-600 py-3 px-6 font-[mulish] text-sm cursor-pointer text-white rounded shadow">Remove Image</span>
                    </div>
                </div>
                
                <div className="mt-[25px]">
                    <label htmlFor="product-desc" className="text-[14px] font-medium font-[mulish] tracking-wide text-gray-600">Product Descriptions</label><br />
                    <div className="w-full h-[150px]">
                        <textarea id="product-desc" placeholder="Enter Product Description" value={productDescription} onChange={(e)=>setProductDescription(e.target.value)} className="w-full h-full resize-none rounded  border border-gray-400 px-2 font-[mulish] text-gray-700 tracking-wide text-base outline-1 outline-none"></textarea>
                    </div>
                </div>

                
                <div className="mt-[20px]">
                    <button disabled={isLoading} type="submit" className={`${isLoading ? "bg-blue-400 text-sm font-medium text-white py-3 px-6 rounded font-[mulish]" : "text-sm font-medium text-white bg-blue-600 py-3 px-6 rounded font-[mulish] cursor-pointer"}`}>{isLoading ? "Loading..." : "Submit"}</button>
                </div>
            </form>
        </div>
    </>)
}

export default AddClothProduct

