import './App.css';
import { useEffect, useState } from 'react';
import { v4 } from "uuid";
import ReactSignatureCanvas from 'react-signature-canvas';
import { imgDB, txtDB } from './Config';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';

function App() {
  const [name, setName] = useState('')
  const [sign, setSign] = useState()
  const [url, setUrl] = useState()
  const [data, setData] = useState([])
  const valRef = collection(txtDB, 'signature')

  const getData = async () => {
    const dataDb = await getDocs(valRef)
    const allData = dataDb.docs.map(val => ({ ...val.data(), id: val.id }))
    setData(allData)
  }

  //   const handleClick = async () =>{
  //     await addDoc(valRef,{ name: 'ajith', sign: '' })
  // }

  useEffect(() => {
    // handleClick()
    getData()
  })


  const handleClear = () => {
    sign.clear()
    setUrl('')
  }
  const handleGenerate = async (id, isdelete) => {
    const url = isdelete ? '' : sign.getTrimmedCanvas().toDataURL('image/png')
    try {
      const docRef = doc(valRef, id);
      await updateDoc(docRef, { sign: url });
      alert(url?"Signature Added Successfully..":"Deleted Successfully..");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }
  const allSigned = data.every((item) => item.sign)


  const generatePDF = () => {
    const doc = new jsPDF();

    // Add and center the title
    const title = "Signature Report";
    doc.setFontSize(22);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Add a 5-line paragraph below the title
    const paragraph =
      "This document serves as a record of signatures for verification purposes. " +
      "Each participant's name and corresponding signature are displayed below. " +
      "Ensure the signatures are correct and legible. " +
      "This record is intended to maintain transparency and accountability. " +
      "Please contact the administrator for any discrepancies.";
    doc.setFontSize(12);
    const margin = 10;
    const paragraphY = 30; // Position below the title
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;

    doc.text(paragraph, margin, paragraphY, { maxWidth: pageWidth });

    // Add dynamic content starting from below the paragraph
    const startY = paragraphY + 50; // Adjust Y position based on paragraph height
    const lineSpacing = 50; // Space between each entry
    const signatureOffset = 10; // Space between the name and the signature

    data.forEach((item, index) => {
      const baseY = startY + index * lineSpacing;

      doc.setFontSize(14);
      // Add name text
      doc.text(`Name: ${item.name}`, margin, baseY);

      if (item.sign) {
        // Add signature below the name with proper spacing
        const imgWidth = 50; // Signature image width
        const imgHeight = 30; // Signature image height
        const imageY = baseY + signatureOffset; // Place the signature below the name
        doc.addImage(item.sign, 'PNG', margin, imageY, imgWidth, imgHeight);
      } else {
        doc.text("Signature: Not Signed", margin, baseY + signatureOffset);
      }
    });

    doc.save("signatures.pdf");
  };

  console.log(data, "data")
  return (
    <div className="App">
      {
        name ?
          <div>
            <h1>Signature Report</h1>
            <p>This document serves as a record of signatures for verification purposes. Each participant's name and corresponding signature are displayed below. Ensure the signatures are correct and legible. This record is intended to maintain transparency and accountability. Please contact the administrator for any discrepancies.</p>
            {
              data.map(val => <div key={val.id}>
                <h1>{val.name}</h1>
                {
                  val.name == name && !val.sign ?
                    <div className='center'>
                      <div>
                        <div style={{ border: "2px solid black", width: 500, height: 200 }}>
                          <ReactSignatureCanvas
                            canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                            ref={data => setSign(data)}
                          />
                        </div>

                        <br></br>
                        <button style={{ height: "30px", width: "60px" }} onClick={handleClear}>Clear</button>
                        <button style={{ height: "30px", width: "60px" }} onClick={() => handleGenerate(val.id)}>Save</button>
                      </div>
                    </div>
                    : (val.sign ?
                      <div>
                        <img src={val.sign} />
                        {val.name == name ? <button className='delete' onClick={() => handleGenerate(val.id, 'delete')}>delete</button> : ''}
                      </div>
                      : <h4>{val.name}  has not signed yet.</h4>)
                }

              </div>)


            }
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            {

              allSigned ? <button className='print' onClick={generatePDF}>Print</button> : ''
            }

            <br /><br />
            <img src={url} />
          </div> :
          <div className='form'>
            <form onSubmit={(e) => setName(e.target.name.value)}>
              <h2>Signature</h2>
              <br/>
              <br/>
              <input name='name' placeholder='Enter Your Name' /><br />
              <button>submit</button>
            </form>
          </div>
      }

    </div>
  );
}

export default App;
