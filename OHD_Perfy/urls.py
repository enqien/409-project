"""OHD_Perfy URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path , include , re_path
from django.conf.urls.static import static
from django.shortcuts import redirect
from .views import *


urlpatterns = [
    path('', lambda request: redirect('/perfy/')),
    path('perfy/', display_home),
    path('perfy/admin/', admin.site.urls),
    path('perfy/login', login_view, name="login"),
    path('perfy/signup', signup_view, name="signup"),
    path('perfy/logout', logout_view, name='logout'),
    path('perfy/manage', manage, name='manage'),
    path('perfy/admin/logout', manage, name='log_out'),
    path('perfy/manage/<str:t_id>', manage_matrix),
    path('perfy/post_data', post_data),
    path('perfy/post_<str:info_type>', insert_info),
    path('perfy/query_<str:info_type>', query_info),
    path('perfy/query_<str:info_type>/', query_info),
    path('perfy/delete_<str:info_type>', delete_info),
    path('perfy/matrix/<str:t_id>', render_matrix,name="my_view"),
    path('perfy/matrix/<str:t_id>/', render_matrix,name="my_view"),
    path('perfy/matrix/<str:t_id>/submit_comment', submit_comment),
    path('perfy/log/<int:log_id>/',display_logs),
    # path('perfy/test', test),
]  + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
