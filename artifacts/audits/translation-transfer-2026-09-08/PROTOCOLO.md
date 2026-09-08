# Transferencia inglés → español: plan de ejecución

Fecha: 8 de septiembre de 2026. Experimento retrospectivo local autorizado por el pedido de traducir y ejecutar pruebas. No cambia la aplicación ni el documento presentado sin revisar los resultados.

## Pregunta

¿Cómo cambian la discriminación de etiquetas binarias y las salidas del modelo congelado cuando los mismos 248 ensayos ingleses de prueba se traducen automáticamente al español?

## Restricciones fijadas antes de calcular resultados

- Datos: partición histórica de prueba, solo `language=en`; no sumar las dos viñetas sintéticas. Las traducciones conservan los IDs y etiquetas originales y NO son nuevas personas. Se conocen resultados previos del conjunto: no es prueba ciega.
- Acceso: copia del corpus ya existente en el proyecto; no descargar otro corpus ni enviar narraciones a servicios externos. La procedencia/licencia histórica del mirror requiere revisión antes de cualquier nueva redistribución; los textos derivados permanecen privados y fuera del repo/entrega.
- Traducción local: Helsinki-NLP/opus-mt-en-es, revisión `5bc4493d463cf000c1f0b50f8d56886a392ed4ab`, inferencia determinista, sin etiquetas en su entrada. Traducir el texto completo por segmentos; registrar segmentación y límites. No editar traducciones según predicciones.
- Umbra: conservar bundle `ridge_v1.joblib`, extractor `distilbert-base-multilingual-cased`, revisión `45c032ab32cc946ad88a166f7cb282f58c753c2e`, CLS, 512 tokens, salida redondeada y limitada 0–100 como runtime. Recalcular originales y traducciones por el mismo camino. Ningún ajuste ni calibración.
- Integridad: comprobar IDs y textos normalizados entre train/val/test; mantener una fila por ensayo. Esto no demuestra identidad de participantes originales. Comparar hashes antes/después de pesos, métricas y particiones.
- Resultados: cinco dimensiones completas, AUC, balanced accuracy y F1 al corte histórico 50, RMSE sobre etiquetas binarias y referencia constante del entrenamiento. Comparar originales/traducciones de forma pareada; bootstrap por ensayo con semilla 20260908 y 2000 remuestreos para AUC y su diferencia. No contar traducciones como observaciones independientes.
- Comprobación de traducción: faltantes, longitud, truncamiento de generación e inferencia. Revisar ejemplos elegidos por orden/longitud antes de examinar métricas; evaluación humana de traducción no realizada, no inventarla.
- Alcance: mide sensibilidad a traducción, NO validez individual española, calibración de 0–100, eficacia de consejos, nuevos autoinformes ni aprobación del CAE. Los estados de producción quedan iguales aunque el experimento sea favorable.

## Pasos y archivos

Ejecución local en esta carpeta aislada; no requiere commits ni nuevos despliegues.

1. `test_transfer.py`: tests con casos pequeños comprobables a mano. Deben rechazar solapamientos, etiquetas incompatibles, traducciones faltantes/duplicadas y segmentación que pierda palabras. Ejecutar antes de crear `transfer.py` y comprobar fallo por implementación ausente.
2. `transfer.py`: selección e integridad, segmentación sin pérdida, alineación por ID y métricas binarias. `pytest -q test_transfer.py` debe quedar verde.
3. `run_transfer.py`: orquestar descarga ya autorizada del traductor y ejecución sin red. Guardar traducciones solo en carpeta privada y resultados agregados aparte. Un ejemplo ficticio previo sirve para medir ejecución, no aporta observaciones a la evaluación.
4. Ejecutar los 248 pares; registrar fallos/filas incompletas sin ocultarlos. Si no completa, informar experimento incompleto, no una evaluación de 248.
5. Revisar métricas e integridad y entregar conclusiones en lenguaje claro. Conservar el reporte agregado y el protocolo; no modificar el modelo ni incorporar nuevos claims académicos automáticamente.

## Fuentes

- Traductor y licencia: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
- Artetxe, Labaka y Agirre (2020), Translation Artifacts in Cross-lingual Transfer Learning: https://aclanthology.org/2020.emnlp-main.618/
- Corpus y splits: `/private/tmp/umbra-entrega-audit.B6Tyg8/repo/ml/README.md` y `ml/data/essays/README.md`. El mirror no pudo consultarse hoy vía web (401); no se reafirman sus derechos de redistribución.
