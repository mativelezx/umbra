# Cómo comprobar y repetir el experimento

## Entorno usado

Python 3.11 del snapshot entregado: `/private/tmp/umbra-entrega-audit.B6Tyg8/repo/ml/.venv/bin/python`.

Código ML del snapshot: `/private/tmp/umbra-entrega-audit.B6Tyg8/repo/ml`, commit `f6eb9bb7edf1351bad8ba463fbf0fe4fd550eb06`. Paquetes exactos en `training-manifest.json`: NumPy 2.1.1, scikit-learn 1.5.2, torch 2.4.1, transformers 4.44.2, MLflow 2.16.2 y DVC 3.55.2.

El código principal del repositorio está en un árbol con cambios previos. No usarlo silenciosamente en lugar del snapshot. No instalar ni actualizar paquetes en producción para este experimento.

Los comandos siguientes se ejecutan desde `/Users/matiasvelez/Developer/umbra/plans/reentrenamiento-persontext-2026-09-08`.

## Comprobar los resultados existentes

```bash
/private/tmp/umbra-entrega-audit.B6Tyg8/repo/ml/.venv/bin/python -m unittest -v test_retrain
/private/tmp/umbra-entrega-audit.B6Tyg8/repo/ml/.venv/bin/python verify_evidence.py --private /Users/matiasvelez/Documents/Umbra-Reentrega-2026-09-08/experimento-ml-persontext-privado --ml-root /private/tmp/umbra-entrega-audit.B6Tyg8/repo/ml
/private/tmp/umbra-entrega-audit.B6Tyg8/repo/ml/.venv/bin/python execute_notebook.py
```

La segunda orden vuelve a calcular métricas y compara los modelos guardados; no los vuelve a entrenar. La tercera ejecuta secuencialmente todas las celdas Python del notebook y guarda sus salidas. No usa un kernel Jupyter: en este entorno no están instalados `nbformat`, `nbclient` ni `ipykernel`. El archivo tiene estructura notebook 4.5, comprobada por el ejecutor local. En un entorno con Jupyter puede abrirse como notebook; esa ejecución mediante kernel no se verificó aquí.

## Qué quedó guardado

La carpeta privada permanente contiene los dos CSV originales, sus referencias DVC, los dos bundles experimentales, embeddings y predicciones privadas, manifiestos y corridas MLflow. Conserva la copia exacta del directorio temporal original `/private/tmp/umbra-retrain-persontext-20260908.Bezcb0`.

Las rutas históricas internas de artefactos MLflow y caché DVC siguen apuntando a ese temporal: no se reescribió la evidencia al copiarla. `verify_evidence.py` admite la copia permanente y comprueba los archivos por hash. Para navegar artefactos con la UI de MLflow una vez eliminado el temporal, se deberá reubicar su almacén explícitamente o abrir los archivos conservados; no se afirma que esa interfaz esté desplegada.

Regresores experimentales: `ridge_persontext_v1.joblib` y `tfidf_persontext_v1.joblib`. Son archivos privados locales, **no sustitutos instalados** de `ml/models/ridge_v1.joblib`.

## Repetir entrenamiento: sólo en una carpeta privada nueva

1. Conservar una copia de este informe. Crear un directorio nuevo con permisos 700, fuera de Git; no reutilizar el del examen terminado.
2. Obtener los CSV desde los enlaces oficiales del protocolo y comprobar sus SHA-256. Sólo uso académico local; no redistribuirlos. No cambiar el archivo para hacer coincidir resultados.
3. Inicializar DVC con `--no-scm` en ese directorio; fijar `DVC_SITE_CACHE_DIR` dentro de él y ejecutar `dvc add persontext-v1.csv persontext-v2.csv`. El primer intento sin ese ajuste falló porque DVC buscó caché en `/Library/Caches`; no hace falta modificar esa carpeta del sistema.
4. Restaurar el snapshot y las dependencias exactas; tener el encoder de la revisión documentada en caché. El runner fuerza modo offline y CPU.
5. Ejecutar `python run_retraining.py train --private RUTA_PRIVADA_NUEVA --ml-root RUTA_DEL_SNAPSHOT_ML`.
6. Verificar que se generó `training-manifest.json` y que dice `test_predictions_computed: false`.
7. Ejecutar `python run_retraining.py evaluate --private RUTA_PRIVADA_NUEVA --ml-root RUTA_DEL_SNAPSHOT_ML` en una copia nueva de esta carpeta de scripts, sin `results.json` ni los otros resultados generados. El programa rechaza sobrescribir evidencia del test.

Repetir exactamente los mismos datos y método comprueba reproducibilidad, **no agrega otra muestra independiente ni autoriza ajustar parámetros mirando este examen**. Para una mejora metodológica posterior, estas 30 personas dejan de ser un test desconocido y hará falta otra reserva de evaluación.

No se llaman APIs pagas, no se despliega, no se migra la base, no se publica ningún CSV ni modelo y no se modifica el estado productivo de confianza.
