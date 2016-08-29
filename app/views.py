from django.forms import ModelForm
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseGone
from django.shortcuts import render, redirect, get_object_or_404
import datetime

from app.models import Book


class BookForm(ModelForm):
    class Meta:
        model = Book
        fields = ['name', 'pages', 'date_written', 'type']

def home(request):
    html = """
    <h1>Django CRUD Example</h1>
    <a href="/books/">Book list</a><br>
    """
    return HttpResponse(html)

def book_list(request, template_name='book_list.html'):
    books = Book.objects.all()
    data = {}
    data['object_list'] = books
    return render(request, template_name, data)

def book_list_range(request, y1, m1, d1, y2, m2, d2, template_name='book_list.html'):
    date1 = datetime.date(int(y1), int(m1), int(d1))
    date2 = datetime.date(int(y2), int(m2), int(d2))
    books = Book.objects.exclude(date_written__lt=date1).exclude(date_written__gt=date2)
    print(len(books), date1, date2)
    data = {}
    data['object_list'] = books
    data['date_range_start'] = date1
    data['date_range_end'] = date2
    return render(request, template_name, data)

def book_create(request, template_name='book_form.html'):
    form = BookForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('book_list')
    return render(request, template_name, {'form':form})

def book_update(request, pk):
    book= get_object_or_404(Book, pk=pk)
    form = BookForm(request.POST or None, instance=book)
    print(request.POST);
    if form.is_valid():
        form.save()
        return HttpResponse(status=200)
    return HttpResponse(status=400)

def book_delete(request, pk):
    book= get_object_or_404(Book, pk=pk)    
    if request.method=='DELETE':
        book.delete()
        return HttpResponse(status=204)
    return HttpResponse(status=405)
