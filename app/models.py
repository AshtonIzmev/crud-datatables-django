from django.core.urlresolvers import reverse
from django.db import models


class Book(models.Model):
    TYPE_CHOICES = ( ('A', 'a_type'), ('B', 'b_type'), ('C', 'c_type'))

    name = models.CharField(max_length=200)
    pages = models.IntegerField()
    date_written = models.DateField()
    type = models.CharField(max_length=1, choices=TYPE_CHOICES, default='A')

    def __unicode__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('books:book_edit', kwargs={'pk': self.pk})