from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
import pandas as pd
import io

app = FastAPI()
storage = {}  # guarda DataFrames em memória
csv_files = {}  # guarda CSV bruto (bytes)

@app.post("/api/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    storage[file.filename] = df
    csv_files[file.filename] = content
    return {"message": f"Arquivo {file.filename} carregado com sucesso!", "rows": len(df)}

@app.get("/api/files")
def list_files():
    return {"files": list(storage.keys())}

@app.get("/api/data/{filename}")
def get_data(filename: str, format: str = "json"):
    if filename not in storage:
        return {"error": "Arquivo não encontrado"}

    if format == "csv":
        return StreamingResponse(
            io.BytesIO(csv_files[filename]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    # default = JSON
    return JSONResponse(storage[filename].to_dict(orient="records"))
