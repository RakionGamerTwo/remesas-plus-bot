import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import fs from 'fs';

const fontPath = path.join(process.cwd(), "fonts", "Roboto-Black.ttf");

if (!fs.existsSync(fontPath)) {
  console.error("¡Ojo! No encontré el archivo en:", fontPath);
}

try {
  registerFont(fontPath, { family: "Roboto Black", weight: "900" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

export async function createImageWithRatesColombia(rates) {
  const imagePath = path.join(process.cwd(), "public", "colombia.jpg");
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  
  ctx.drawImage(image, 0, 0);
  
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";    
  ctx.textBaseline = "middle";

  const fechaActual = new Date();
  const datePart = fechaActual.toLocaleString("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).replace(/-/g, "/");

  let timePart = fechaActual.toLocaleString("es-VE", {
    timeZone: "America/Caracas",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();

  timePart = timePart.replace(/\./g, "")      
                     .replace(/\s+/g, "")    
                     .replace(/([ap]m)$/, " $1"); 

  const now = `${datePart} Hora ${timePart}`;
  ctx.font = "24px Roboto Black"; 
  const dateX = 932; 
  const dateY = 160;
  ctx.fillText(now, dateX, dateY);

  const positions = {
    "Perú": [315, 350],
    "Brasil": [315, 470],
    "EEUU": [330, 585],
    "Argentina": [310, 710],
    "Bolivia": [310, 830],
    "Ecuador": [860, 350],
    "Panamá": [860, 470],
    "Chile": [850, 585],
    "Mexico": [850, 710],
    "España": [865, 830],
    "Dominicana": [575, 940],
  };

  ctx.font = "900 70px Roboto Black";

 for (const [country, value] of Object.entries(rates)) {
  const pos = positions[country];
  if (pos) {
    const text = `${value}`;
    
    ctx.lineWidth = 0.5; 
    ctx.strokeStyle =   "#ffffff"; 
    
    ctx.strokeText(text, pos[0], pos[1]);
    ctx.fillText(text, pos[0], pos[1]);
  }
}
  
  return canvas.toBuffer("image/png");
}