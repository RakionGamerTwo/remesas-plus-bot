import { bot } from "../../../lib/telegram";
import { getRates } from "../../../lib/fetchRates";
import { createImageWithRatesPeru } from "../../../lib/processorPeru";
import { createImageWithRatesChile } from "../../../lib/processorChile";
import { createImageWithRatesColombia } from "../../../lib/processorColombia";
import { createImageWithRatesEEUU } from "../../../lib/processorEEUU";
import { createImageWithRatesEspana } from "../../../lib/processorEspana";
import { createImageWithRatesPanama } from "../../../lib/processorPanama";
import { createImageWithRatesMexico } from "../../../lib/processorMexico";
import { createImageWithRatesBrasil} from "../../../lib/processorBrasil";
import { createImageWithRatesVenezuela } from "../../../lib/processorVenezuela";
import { waitUntil } from "@vercel/functions";

export const maxDuration = 60;

const IMAGE_PROCESSORS = [
  { key: 'chile', processor: createImageWithRatesChile },
  { key: 'venezuela', processor: createImageWithRatesVenezuela },
  { key: 'peru', processor: createImageWithRatesPeru },
  { key: 'colombia', processor: createImageWithRatesColombia },
  { key: 'eeuu', processor: createImageWithRatesEEUU },
  { key: 'espana', processor: createImageWithRatesEspana },
  { key: 'panama', processor: createImageWithRatesPanama },
  { key: 'mexico', processor: createImageWithRatesMexico },
  { key: 'brasil', processor: createImageWithRatesBrasil },
];

const PERSISTENT_KEYBOARD = {
  reply_markup: {
    keyboard: [[{ text: "Generar Tasas💸" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

export async function POST(req) {
  try {
    const update = await req.json();

    const chatId = update.message?.chat?.id;
    const text = (update.message?.text || "").trim();

    // Si no hay un chat ID válido, ignoramos la petición
    if (!chatId) {
      return new Response("ok", { status: 200 });
    }

    const WELCOME_MESSAGE = `🚀 ¡Hola! Soy PlusRateBot. Estoy listo para generar tus imágenes.

Sigue estos pasos rápidos:

1️⃣ Escribe cualquier cosa (un punto, una letra) o toca el botón [Generar Tasas💸].
2️⃣ Dame hasta 60 segundos para procesar los diseños.
3️⃣ Recibirás tus imágenes con los valores actualizados al instante.`;

    // Manejar el comando de inicio
    if (text === "/start" || text === "start") {
      await bot.sendMessage(chatId, WELCOME_MESSAGE, PERSISTENT_KEYBOARD);
      return new Response("ok", { status: 200 });
    }

    // Si el usuario escribe CUALQUIER COSA (que no sea /start)
    if (text) {
      const processingMsg = await bot.sendMessage(
        chatId,
        "⏳ Procesando imágenes... Esto puede durar máximo 1 minuto",
        PERSISTENT_KEYBOARD
      );

      waitUntil(
        (async () => {
          try {
            const rawRates = await getRates();

            const rates = {
              chile: rawRates["Chile"] || rawRates["CHILE"],
              peru: rawRates["Perú"] || rawRates["Peru"] || rawRates["PERU"],
              colombia: rawRates["Colombia"] || rawRates["COLOMBIA"],
              eeuu: rawRates["EEUU"] || rawRates["eeuu"],
              espana: rawRates["España"] || rawRates["españa"],
              panama: rawRates["Panamá"] || rawRates["Panama"],
              mexico: rawRates["Mexico"] || rawRates["México"] || rawRates["MEXICO"],
              brasil: rawRates["Brasil"] || rawRates["brasil"],
              venezuela: rawRates["Venezuela"] || rawRates["venezuela"],
            };

            if (Object.values(rates).every(val => !val || Object.keys(val).length === 0)) {
              await bot.editMessageText("No encontré tasas disponibles en este momento.", {
                chat_id: chatId,
                message_id: processingMsg.message_id,
              });
              return;
            }

            const imagePromises = IMAGE_PROCESSORS
              .filter(({ key }) => rates[key] && Object.keys(rates[key]).length > 0)
              .map(async ({ key, processor }) => {
                try {
                  const buffer = await processor(rates[key]);
                  return { buffer };
                } catch (error) {
                  console.error(`Error procesando ${key}:`, error);
                  return null;
                }
              });

            const images = (await Promise.all(imagePromises)).filter(Boolean);

            if (images.length === 0) {
              await bot.sendMessage(
                chatId,
                "No se pudieron generar imágenes en este momento."
              );
              return;
            }

            // Enviar las imágenes una por una
            for (let i = 0; i < images.length; i++) {
              const img = images[i];
              await bot.sendPhoto(chatId, img.buffer, {
                caption: img.caption,
              });
            }
          } catch (bgError) {
            console.error("Error crítico en el proceso de fondo:", bgError);
            await bot.sendMessage(
              chatId,
              "Ocurrió un error inesperado al procesar las tasas. Intenta nuevamente escribiendo cualquier cosa."
            );
          }
        })()
      );

      return new Response("ok", { status: 200 });
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("ok", { status: 200 });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: "API Bot funcionando" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
