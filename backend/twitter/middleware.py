import logging
import traceback
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        # Log do erro
        logger.error(f"Error in request {request.path}: {str(exception)}")
        logger.error(traceback.format_exc())
        
        # Se for uma requisição para API, retornar JSON
        if request.path.startswith('/api/'):
            return JsonResponse({
                'error': 'Internal server error',
                'message': str(exception),
                'path': request.path
            }, status=500)
        
        # Para outras requisições, deixar o Django lidar
        return None
