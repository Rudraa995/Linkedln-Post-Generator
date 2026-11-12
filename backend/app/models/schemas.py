"""
Pydantic models for request/response validation.
Mirrors the TypeScript interfaces in the frontend.
"""

from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class PostType(str, Enum):
    PROJECT_ANNOUNCEMENT = "project-announcement"
    ACHIEVEMENT = "achievement"
    LEARNING_EXPERIENCE = "learning-experience"
    INTERNSHIP_EXPERIENCE = "internship-experience"
    JOB_UPDATE = "job-update"
    TECHNICAL_KNOWLEDGE = "technical-knowledge"
    PERSONAL_STORY = "personal-story"
    INDUSTRY_INSIGHTS = "industry-insights"
    CAREER_ADVICE = "career-advice"
    PRODUCT_LAUNCH = "product-launch"


class Tone(str, Enum):
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    STORYTELLING = "storytelling"
    INSPIRATIONAL = "inspirational"
    TECHNICAL = "technical"
    HUMOROUS = "humorous"
    CONVERSATIONAL = "conversational"


class Length(str, Enum):
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"


class Language(str, Enum):
    ENGLISH = "english"
    HINDI = "hindi"
    GUJARATI = "gujarati"


class EmojiPreference(str, Enum):
    NONE = "none"
    MINIMAL = "minimal"
    CREATIVE = "creative"


class TargetAudience(str, Enum):
    RECRUITERS = "recruiters"
    DEVELOPERS = "developers"
    HR_PROFESSIONALS = "hr-professionals"
    STUDENTS = "students"
    ENTREPRENEURS = "entrepreneurs"
    BUSINESS_OWNERS = "business-owners"
    TECH_COMMUNITY = "tech-community"
    GENERAL_AUDIENCE = "general-audience"


class PostStatus(str, Enum):
    DRAFT = "draft"
    PLANNED = "planned"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"


class ImageStyle(str, Enum):
    PROFESSIONAL_BANNER = "professional-banner"
    TECHNOLOGY_ILLUSTRATION = "technology-illustration"
    MINIMALIST_DESIGN = "minimalist-design"
    BUSINESS_GRAPHIC = "business-graphic"
    EDUCATIONAL_INFOGRAPHIC = "educational-infographic"
    CREATIVE_ILLUSTRATION = "creative-illustration"


class ImageDimension(str, Enum):
    LANDSCAPE = "landscape"
    SQUARE = "square"
    PORTRAIT = "portrait"


# Profile Models
class Skill(BaseModel):
    id: str
    name: str


class Experience(BaseModel):
    id: str
    role: str
    company: str
    duration: str
    description: str
    type: str = "work"


class Project(BaseModel):
    id: str
    name: str
    description: str
    technologies: List[str] = []
    link: Optional[str] = None


class Certification(BaseModel):
    id: str
    name: str
    issuer: str
    year: int


class Achievement(BaseModel):
    id: str
    title: str
    description: str
    date: str


class UserProfile(BaseModel):
    id: str
    fullName: str = ""
    headline: str = ""
    aboutMe: str = ""
    currentRole: str = ""
    education: str = ""
    collegeUniversity: str = ""
    skills: List[Skill] = []
    workExperience: List[Experience] = []
    internshipExperience: List[Experience] = []
    projects: List[Project] = []
    certifications: List[Certification] = []
    achievements: List[Achievement] = []
    professionalInterests: List[str] = []
    createdAt: str
    updatedAt: str


# Post Models
class LinkedInPost(BaseModel):
    id: str
    topic: str
    postType: PostType
    tone: Tone
    targetAudience: TargetAudience
    length: Length
    language: Language
    emojiPreference: EmojiPreference
    hashtagsEnabled: bool = True
    useProfileContext: bool = False
    content: str = ""
    hook: Optional[str] = None
    mainContent: Optional[str] = None
    conclusion: Optional[str] = None
    hashtags: List[str] = []
    cta: Optional[str] = None
    imageUrl: Optional[str] = None
    imagePrompt: Optional[str] = None
    status: PostStatus = PostStatus.DRAFT
    scheduledAt: Optional[str] = None
    sourceUrl: Optional[str] = None
    sourceTitle: Optional[str] = None
    createdAt: str
    updatedAt: str


# Request/Response Models
class GeneratePostRequest(BaseModel):
    topic: str
    postType: str = "project-announcement"
    tone: str = "professional"
    targetAudience: str = "general-audience"
    length: str = "medium"
    language: str = "english"
    emojiPreference: str = "minimal"
    hashtagsEnabled: bool = True
    useProfileContext: bool = False
    profile: Optional[UserProfile] = None


class GeneratePostResponse(BaseModel):
    success: bool
    post: dict


class GeneratePostFromUrlRequest(BaseModel):
    topic: Optional[str] = None
    postType: str = "project-announcement"
    tone: str = "professional"
    targetAudience: str = "general-audience"
    length: str = "medium"
    language: str = "english"
    emojiPreference: str = "minimal"
    hashtagsEnabled: bool = True
    sourceContent: str
    sourceTitle: str
    sourceUrl: str
    profile: Optional[UserProfile] = None


class AnalyzeUrlRequest(BaseModel):
    url: str


class AnalyzeUrlResponse(BaseModel):
    success: bool
    content: dict


class RewritePostRequest(BaseModel):
    content: str
    action: str
    tone: Optional[str] = None


class RegenerateSectionRequest(BaseModel):
    content: str
    section: str
    context: dict


class GenerateHashtagsRequest(BaseModel):
    topic: str
    content: str = ""
    count: int = 5


class GenerateImageRequest(BaseModel):
    prompt: str
    style: str = "professional-banner"
    dimension: str = "landscape"


class CalendarEvent(BaseModel):
    id: str
    postId: str = ""
    title: str
    date: str
    time: Optional[str] = None
    status: PostStatus = PostStatus.DRAFT
    createdAt: str
    updatedAt: Optional[str] = None
