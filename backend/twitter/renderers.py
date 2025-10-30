from rest_framework.renderers import JSONRenderer
from rest_framework.utils import json


class SafeBrowsableAPIRenderer(JSONRenderer):
    """
    Renderer personalizado que evita o erro 'Request' object has no attribute 'copy'
    """

    media_type = "text/html"
    format = "html"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        """
        Renderiza os dados como JSON, mas com content-type text/html
        """
        if renderer_context is None:
            renderer_context = {}

        # Se não há dados, retornar HTML básico
        if data is None:
            return (
                b"<html><body><h1>API Response</h1>"
                b"<p>No data available</p></body></html>"
            )

        # Renderizar como JSON
        json_data = json.dumps(data, indent=2, ensure_ascii=False)

        # Criar HTML básico com o JSON
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>API Response</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                pre {{
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                    overflow-x: auto;
                }}
                h1 {{ color: #333; }}
            </style>
        </head>
        <body>
            <h1>API Response</h1>
            <pre>{json_data}</pre>
        </body>
        </html>
        """

        return html_content.encode("utf-8")
