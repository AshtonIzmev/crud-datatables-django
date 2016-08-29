from django.conf.urls import patterns, url, include
from django.contrib import admin

from app import views

urlpatterns = patterns('',
                       url(r'^books/$', views.book_list, name='book_list'),
                       url(r'^books/(?P<y1>\d+)/(?P<m1>\d+)/(?P<d1>\d+)/(?P<y2>\d+)/(?P<m2>\d+)/(?P<d2>\d+)$',
                           views.book_list_range, name='book_list_range'),
                       url(r'^new$', views.book_create, name='book_new'),
                       url(r'^edit/(?P<pk>\d+)$', views.book_update, name='book_edit'),
                       url(r'^delete/(?P<pk>\d+)$', views.book_delete, name='book_delete'),

                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^$', 'app.views.home'),
                       )