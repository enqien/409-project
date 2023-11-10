from django.contrib.auth.models import User
from django.http import HttpResponse , HttpResponseBadRequest
from functools import wraps

def is_valid_user(username, password):
    """
    Checks if the given username and password are valid.

    Args:
        username (str): The username to check.
        password (str): The password to check.

    Returns:
        bool: True if the user is valid, False otherwise.
    """
    try:
        user = User.objects.get(username=username)
        return user.check_password(password)
    except User.DoesNotExist:
        return False
    
def post_verification(view_func):
    """
    Decorator function for performing post data verification.

    Args:
        view_func (function): The view function to decorate.

    Returns:
        function: The decorated view function.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.method != "POST":
            return view_func(request, *args, **kwargs)
        post_data = request.POST.copy()
        user_name = post_data.pop('user_name', None)
        user_password = post_data.pop('user_password', None)
        if not user_name:
            return HttpResponseBadRequest(f"No user_name for Posting.")
        if not user_password:
            return HttpResponseBadRequest(f"No user_password for Posting.")
        if not is_valid_user(username=user_name[0],password = user_password[0]):
            return HttpResponseBadRequest(f"Verfication Failed: user_name or user_password not correct")
        request.POST = post_data
        return view_func(request, *args, **kwargs)
    return wrapper
