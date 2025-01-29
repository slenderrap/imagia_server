const fs = require('fs');
const {convertImageToBase64} = require('./utils.js');

// const imagePostTest = async () => {

//     const imageUrl = "ollama.png";
//     const imageBuffer = fs.readFileSync(imageUrl);
//     const file = imageBuffer;

//     const response = await fetch("http://localhost:3000/api/analitzar-imatge", {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             prompt: "What is in the image?",
//             stream: false,
//             images: [
//                 await convertImageToBase64(file)
//             ]
//         })
//     });

//     if(!response.ok) {
//         console.error("Error obtenint resposta del servidor: ", response.status, response);
//         return;
//     }

//     const data = await response.json();

//     if(data["status"] === "error") {
//         console.error(data["message"]);
//         return;
//     }
//     console.log(data);
// }


// imagePostTest().then(() => {
//     console.log("Test finished")
// });

const axios = require('axios');
const e = require('express');

// Funció per provar la petició
async function provarPeticioImatge() {

    const imageUrl = "public/ollama.png";
    const imageBuffer = fs.readFileSync(imageUrl);

  try {
    const peticioData = {
      prompt: "What is in this picture?",
      stream: false,
      images: [ await convertImageToBase64(imageBuffer)] 
    };

    const response = await axios.post('http://localhost:3000/api/analitzar-imatge', 
      peticioData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ABCD1234EFGH5678IJKL'
        }
      }
    );

    console.log('Resposta exitosa:', response.data);
  } catch (error) {
    if (error.response) {
      // L'error ve del servidor amb un status diferent de 2xx
      console.error('Error de resposta:', error.response.data);
    } else if (error.request) {
      // La petició es va fer però no es va rebre resposta
      console.error('Error de petició:', error.request);
    } else {
      // Error en la configuració de la petició
      console.error('Error:', error.message);
    }
  }
}

// Prova amb token invàlid
async function provarPeticioInvalida() {
  try {
    const peticioData = {
      model: "llama3.2-vision:latest",
      prompt: "What is in this picture?",
      imatges: ["base64_encoded_image1"]
    };

    const response = await axios.post('http://localhost:3000/api/analitzar-imatge', 
      peticioData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer TOKEN_INVALID'
        }
      }
    );
  } catch (error) {
    console.log('Resposta d\'error esperada:', error.response?.data);
  }
}

async function testUserCreation() {
  try {
    const response = await axios.post('http://localhost:3000/api/usuaris/registrar', {
      telefon: '123456789',
      nickname: 'nickname',
      contrasenya: 'password',
      email: 'mail@gmail.com'
    });
  } catch (error) {
    console.error(error);
  }
}

// provarPeticioImatge();
// provarPeticioInvalida();

testUserCreation();