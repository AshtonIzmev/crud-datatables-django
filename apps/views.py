from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse

def home(request):
    html = """
    <h1>Django CRUD Example</h1>
    <a href="/books/">Function Based Views</a><br>
    """
    return HttpResponse(html)