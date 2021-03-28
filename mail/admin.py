from django.contrib import admin

# Register your models here.
from .models import User, Email
from django.contrib.auth.admin import UserAdmin

admin.site.register(User, UserAdmin)
admin.site.register(Email)
