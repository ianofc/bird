from django import forms
from .models import Bird, Profile, Community, WorkExperience, Education

# ========================================================
# 🦅 BIRD (POSTAGEM)
# ========================================================
class BirdForm(forms.ModelForm):
    class Meta:
        model = Bird
        fields = ['content', 'image', 'video']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'w-full bg-transparent border-none text-slate-800 text-lg placeholder-slate-400 focus:ring-0 resize-none',
                'placeholder': 'No que você está pensando?',
                'rows': 2,
                'maxlength': '500',
                'id': 'bird-content-input'
            }),
            'image': forms.FileInput(attrs={
                'class': 'hidden', 
                'id': 'file-input-image',
                'accept': 'image/*'
            }),
            'video': forms.FileInput(attrs={
                'class': 'hidden', 
                'id': 'file-input-video',
                'accept': 'video/mp4,video/x-m4v,video/*'
            })
        }

    def clean(self):
        cleaned_data = super().clean()
        content = cleaned_data.get('content')
        image = cleaned_data.get('image')
        video = cleaned_data.get('video')

        if not content and not image and not video:
            raise forms.ValidationError("Você não pode publicar um post vazio.")
        
        if image and video:
            raise forms.ValidationError("Escolha apenas uma mídia: Imagem ou Vídeo.")
            
        return cleaned_data

# ========================================================
# 👤 PERFIL (EDIÇÃO)
# ========================================================
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = [
            'full_name', 'bio', 'current_city', 'hometown', 
            'birth_date', 'gender', 'phone', 'public_email', 
            'avatar', 'cover_image'
        ]
        widgets = {
            'birth_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-input'}),
            'bio': forms.Textarea(attrs={'rows': 3, 'class': 'form-textarea'}),
            # Adicione classes Tailwind conforme seu design system aqui
        }

# ========================================================
# 👥 COMUNIDADES
# ========================================================
class CommunityForm(forms.ModelForm):
    class Meta:
        model = Community
        fields = ['name', 'description', 'capa', 'is_private']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500',
                'placeholder': 'Nome da Comunidade'
            }),
            'description': forms.Textarea(attrs={
                'class': 'w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500',
                'rows': 3,
                'placeholder': 'Sobre o que é este grupo?'
            }),
            'is_private': forms.CheckboxInput(attrs={
                'class': 'rounded text-indigo-600 focus:ring-indigo-500'
            })
        }

# ========================================================
# 🎓 & 💼 CURRÍCULO
# ========================================================
class WorkExperienceForm(forms.ModelForm):
    class Meta:
        model = WorkExperience
        fields = ['company', 'position', 'start_date', 'end_date', 'is_current', 'description']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
        }

class EducationForm(forms.ModelForm):
    class Meta:
        model = Education
        fields = ['institution', 'course', 'start_date', 'end_date']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
        }