# User Flows Documentation

## Overview

This document details all user interaction flows for authentication and user management in the HireXp platform, including registration, login, profile management, and role-specific workflows.

## Registration Flows

### 1. Trainee Registration Flow

```mermaid
flowchart TD
    Start([User visits HireXp]) --> Landing[Landing Page]
    Landing --> Click[Click Get Started/Register]
    Click --> RegPage[Registration Page]

    RegPage --> ChooseRole[Select Trainee Role]
    ChooseRole --> Form[Fill Registration Form]

    Form --> Validate{Validate<br/>Input}
    Validate -->|Invalid| ShowError[Show Error Messages]
    ShowError --> Form

    Validate -->|Valid| CheckEmail{Email<br/>Exists?}
    CheckEmail -->|Yes| EmailError[Show Email Exists Error]
    EmailError --> Suggest[Suggest Login or Reset]

    CheckEmail -->|No| CreateUser[Create User Account]
    CreateUser --> SendEmail[Send Verification Email]
    SendEmail --> ShowSuccess[Show Success Message]

    ShowSuccess --> EmailSent[Check Your Email Page]
    EmailSent --> UserEmail[User Checks Email]
    UserEmail --> ClickVerify[Click Verification Link]

    ClickVerify --> VerifyToken{Valid<br/>Token?}
    VerifyToken -->|No| TokenError[Show Token Error]
    TokenError --> Resend[Option to Resend]

    VerifyToken -->|Yes| ActivateAccount[Activate Account]
    ActivateAccount --> RedirectLogin[Redirect to Login]
    RedirectLogin --> Login[Login Page]
    Login --> Dashboard[Trainee Dashboard]

    style Start fill:#e1f5ff
    style Dashboard fill:#c8e6c9
```

### 2. Instructor Registration Flow

```mermaid
flowchart TD
    Start([Professional Educator]) --> Landing[Landing Page]
    Landing --> TeachCTA[Click Become an Instructor]

    TeachCTA --> InstructorInfo[Instructor Information Page]
    InstructorInfo --> Requirements[View Requirements]
    Requirements --> Apply[Click Apply Now]

    Apply --> RegForm[Registration Form]
    RegForm --> RoleInstructor[Auto-Select Instructor Role]

    RoleInstructor --> FillBasic[Fill Basic Info]
    FillBasic --> FillProfessional[Fill Professional Info<br/>- Experience<br/>- Certifications<br/>- Specializations]

    FillProfessional --> Upload[Upload Documents<br/>- Resume<br/>- Certificates]

    Upload --> Submit{Submit<br/>Application}
    Submit -->|Invalid| Errors[Show Validation Errors]
    Errors --> FillBasic

    Submit -->|Valid| CreatePending[Create Pending Account]
    CreatePending --> NotifyAdmin[Notify Admin for Review]
    CreatePending --> EmailApplicant[Email Confirmation to Applicant]

    EmailApplicant --> WaitReview[Application Under Review Page]

    NotifyAdmin --> AdminReview{Admin<br/>Review}
    AdminReview -->|Reject| RejectEmail[Send Rejection Email]
    RejectEmail --> CanReapply[Option to Reapply]

    AdminReview -->|Approve| ApproveEmail[Send Approval Email]
    ApproveEmail --> ActivateInstructor[Activate Instructor Account]
    ActivateInstructor --> SetupProfile[Instructor Profile Setup]
    SetupProfile --> InstructorDash[Instructor Dashboard]

    style Start fill:#e1f5ff
    style InstructorDash fill:#c8e6c9
```

### 3. Company Registration Flow

```mermaid
flowchart TD
    Start([Company HR]) --> Landing[Landing Page]
    Landing --> CompanyCTA[Click For Companies]

    CompanyCTA --> CompanyInfo[Company Benefits Page]
    CompanyInfo --> GetStarted[Click Get Started]

    GetStarted --> CompanyReg[Company Registration Form]
    CompanyReg --> FillCompany[Fill Company Details<br/>- Company Name<br/>- Industry<br/>- Size<br/>- Website]

    FillCompany --> FillContact[Fill Contact Person Info]
    FillContact --> FillBilling[Billing Information<br/>(Optional for Trial)]

    FillBilling --> Verify{Verify<br/>Company}
    Verify -->|Invalid| VerifyError[Company Verification Failed]
    VerifyError --> Support[Contact Support]

    Verify -->|Valid| CreateCompany[Create Company Account]
    CreateCompany --> SendVerify[Send Verification Email]
    SendVerify --> VerifyDomain[Domain Verification]

    VerifyDomain --> Trial{Start<br/>Trial?}
    Trial -->|Yes| EnableTrial[Enable 30-Day Trial]
    Trial -->|No| SelectPlan[Select Subscription Plan]

    EnableTrial --> CompanyDash[Company Dashboard]
    SelectPlan --> Payment[Payment Process]
    Payment --> CompanyDash

    style Start fill:#e1f5ff
    style CompanyDash fill:#c8e6c9
```

### 4. Google OAuth Registration

```mermaid
flowchart TD
    Start([User]) --> RegPage[Registration Page]
    RegPage --> GoogleBtn[Click Continue with Google]

    GoogleBtn --> GoogleAuth[Redirect to Google]
    GoogleAuth --> GoogleLogin[User Logs into Google]
    GoogleLogin --> Consent[Grant Permissions]

    Consent --> Callback[Return to HireXp]
    Callback --> CheckUser{User<br/>Exists?}

    CheckUser -->|Yes| LoadProfile[Load Existing Profile]
    LoadProfile --> Dashboard[User Dashboard]

    CheckUser -->|No| CreateFromGoogle[Create New Account]
    CreateFromGoogle --> ImportData[Import Google Profile<br/>- Name<br/>- Email<br/>- Avatar]

    ImportData --> ChooseRole[Choose Role<br/>- Trainee<br/>- Instructor<br/>- Company]

    ChooseRole --> CompleteProfile[Complete Profile Form]
    CompleteProfile --> SaveProfile[Save Profile]
    SaveProfile --> Dashboard

    style Start fill:#e1f5ff
    style Dashboard fill:#c8e6c9
```

## Login Flows

### 1. Standard Login Flow

```mermaid
flowchart TD
    Start([Returning User]) --> Homepage[Homepage]
    Homepage --> LoginBtn[Click Login]

    LoginBtn --> LoginPage[Login Page]
    LoginPage --> EnterCreds[Enter Email & Password]

    EnterCreds --> Remember[Check Remember Me?]
    Remember --> Submit[Submit Form]

    Submit --> Validate{Valid<br/>Credentials?}
    Validate -->|No| LoginError[Show Error]
    LoginError --> Attempts{Too Many<br/>Attempts?}
    Attempts -->|Yes| LockAccount[Lock Account 30 min]
    Attempts -->|No| EnterCreds

    Validate -->|Yes| CheckStatus{Account<br/>Status}
    CheckStatus -->|Suspended| Suspended[Show Suspended Message]
    CheckStatus -->|Not Verified| NotVerified[Show Verify Email]
    NotVerified --> ResendOption[Option to Resend]

    CheckStatus -->|Active| CreateSession[Create Session]
    CreateSession --> SetCookies[Set Auth Cookies]
    SetCookies --> RedirectDash{Redirect by<br/>Role}

    RedirectDash -->|Trainee| TraineeDash[Trainee Dashboard]
    RedirectDash -->|Instructor| InstructorDash[Instructor Dashboard]
    RedirectDash -->|Company| CompanyDash[Company Dashboard]
    RedirectDash -->|Admin| AdminDash[Admin Dashboard]

    style Start fill:#e1f5ff
    style TraineeDash fill:#c8e6c9
    style InstructorDash fill:#c8e6c9
    style CompanyDash fill:#c8e6c9
    style AdminDash fill:#c8e6c9
```

### 2. Password Reset Flow

```mermaid
flowchart TD
    Start([Forgot Password]) --> LoginPage[Login Page]
    LoginPage --> ForgotLink[Click Forgot Password]

    ForgotLink --> ResetPage[Password Reset Page]
    ResetPage --> EnterEmail[Enter Email Address]

    EnterEmail --> Submit[Submit Request]
    Submit --> CheckEmail{Email<br/>Exists?}

    CheckEmail -->|Yes| GenerateToken[Generate Reset Token]
    CheckEmail -->|No| SameMessage[Show Success Message<br/>(Security: Same as Yes)]

    GenerateToken --> SendEmail[Send Reset Email]
    SendEmail --> SameMessage

    SameMessage --> UserEmail[User Checks Email]
    UserEmail --> ClickReset[Click Reset Link]

    ClickReset --> ValidateToken{Valid<br/>Token?}
    ValidateToken -->|No| ExpiredToken[Show Token Expired]
    ExpiredToken --> RequestNew[Request New Link]

    ValidateToken -->|Yes| NewPassPage[New Password Page]
    NewPassPage --> EnterNewPass[Enter New Password]
    EnterNewPass --> ConfirmPass[Confirm Password]

    ConfirmPass --> ValidatePass{Valid<br/>Password?}
    ValidatePass -->|No| PassError[Show Requirements]
    PassError --> EnterNewPass

    ValidatePass -->|Yes| UpdatePass[Update Password]
    UpdatePass --> InvalidateSessions[Invalidate All Sessions]
    InvalidateSessions --> SuccessMsg[Show Success]
    SuccessMsg --> RedirectLogin[Redirect to Login]

    style Start fill:#e1f5ff
    style RedirectLogin fill:#c8e6c9
```

## Profile Management Flows

### 1. Profile Update Flow

```mermaid
flowchart TD
    Start([User Logged In]) --> Dashboard[Dashboard]
    Dashboard --> ProfileMenu[Click Profile Menu]

    ProfileMenu --> EditProfile[Click Edit Profile]
    EditProfile --> ProfilePage[Profile Edit Page]

    ProfilePage --> Tabs{Choose<br/>Section}
    Tabs --> BasicInfo[Basic Information]
    Tabs --> Professional[Professional Info]
    Tabs --> Preferences[Preferences]
    Tabs --> Security[Security Settings]

    BasicInfo --> EditBasic[Edit Name, Bio, Location]
    Professional --> EditPro[Edit Skills, Experience]
    Preferences --> EditPref[Edit Notifications, Theme]
    Security --> EditSec[Change Password, 2FA]

    EditBasic --> SaveBasic[Save Changes]
    EditPro --> SavePro[Save Changes]
    EditPref --> SavePref[Save Changes]
    EditSec --> VerifyPassword[Verify Current Password]
    VerifyPassword --> SaveSec[Save Security Changes]

    SaveBasic --> UpdateDB[Update Database]
    SavePro --> UpdateDB
    SavePref --> UpdateDB
    SaveSec --> UpdateDB

    UpdateDB --> RefreshSession[Refresh Session Data]
    RefreshSession --> ShowSuccess[Show Success Message]
    ShowSuccess --> UpdatedProfile[Updated Profile Page]

    style Start fill:#e1f5ff
    style UpdatedProfile fill:#c8e6c9
```

### 2. Avatar Upload Flow

```mermaid
flowchart TD
    Start([Profile Page]) --> AvatarSection[Avatar Section]
    AvatarSection --> ClickChange[Click Change Avatar]

    ClickChange --> FileDialog[Open File Dialog]
    FileDialog --> SelectImage[Select Image File]

    SelectImage --> Validate{Valid<br/>Image?}
    Validate -->|No| ErrorMsg[Show Error<br/>- Size > 5MB<br/>- Wrong Format]
    ErrorMsg --> FileDialog

    Validate -->|Yes| Preview[Show Preview]
    Preview --> CropOption[Optional: Crop/Resize]
    CropOption --> Confirm[Confirm Upload]

    Confirm --> Upload[Upload to Cloudinary]
    Upload --> Progress[Show Upload Progress]

    Progress --> Complete{Upload<br/>Complete?}
    Complete -->|No| UploadError[Show Upload Error]
    UploadError --> Retry[Retry Option]

    Complete -->|Yes| UpdateProfile[Update Profile Avatar URL]
    UpdateProfile --> RefreshUI[Refresh UI Components]
    RefreshUI --> ShowNewAvatar[Display New Avatar]

    style Start fill:#e1f5ff
    style ShowNewAvatar fill:#c8e6c9
```

## Role Management Flows

### 1. Admin Role Assignment Flow

```mermaid
flowchart TD
    Start([Admin User]) --> AdminDash[Admin Dashboard]
    AdminDash --> UsersMenu[Users Management]

    UsersMenu --> UsersList[Users List Page]
    UsersList --> SearchUser[Search/Filter Users]
    SearchUser --> SelectUser[Select User]

    SelectUser --> UserDetails[User Details Page]
    UserDetails --> RoleSection[Role Management Section]
    RoleSection --> ChangeRole[Click Change Role]

    ChangeRole --> RoleModal[Role Change Modal]
    RoleModal --> SelectNew[Select New Role]
    SelectNew --> EnterReason[Enter Reason<br/>(Required)]

    EnterReason --> Confirm{Confirm<br/>Change?}
    Confirm -->|No| Cancel[Close Modal]

    Confirm -->|Yes| ValidatePerms{Has<br/>Permission?}
    ValidatePerms -->|No| PermError[Permission Denied]

    ValidatePerms -->|Yes| UpdateRole[Update User Role]
    UpdateRole --> LogAudit[Create Audit Log]
    LogAudit --> InvalidateSession[Invalidate User Sessions]
    InvalidateSession --> SendNotification[Email User]

    SendNotification --> RefreshPage[Refresh User Details]
    RefreshPage --> ShowUpdated[Show Updated Role]

    style Start fill:#ff6b6b,color:#fff
    style ShowUpdated fill:#c8e6c9
```

### 2. Instructor Verification Flow

```mermaid
flowchart TD
    Start([Admin]) --> PendingList[Pending Instructors List]
    PendingList --> SelectApp[Select Application]

    SelectApp --> ReviewApp[Review Application Details]
    ReviewApp --> ViewDocs[View Submitted Documents]
    ViewDocs --> VerifyCreds[Verify Credentials]

    VerifyCreds --> Decision{Approve?}
    Decision -->|Reject| RejectForm[Fill Rejection Form]
    RejectForm --> RejectReason[Enter Rejection Reasons]
    RejectReason --> SendRejection[Send Rejection Email]

    Decision -->|Approve| ApproveForm[Fill Approval Form]
    ApproveForm --> SetPermissions[Set Instructor Permissions]
    SetPermissions --> SetSpecializations[Assign Specializations]

    SetSpecializations --> CreateInstructor[Create Instructor Profile]
    CreateInstructor --> ActivateAccount[Activate Account]
    ActivateAccount --> SendWelcome[Send Welcome Email]

    SendWelcome --> UpdateStatus[Update Application Status]
    UpdateStatus --> Complete[Verification Complete]

    style Start fill:#ff6b6b,color:#fff
    style Complete fill:#c8e6c9
```

## Security Flows

### 1. Session Management Flow

```mermaid
flowchart TD
    Start([User Action]) --> CheckSession{Session<br/>Valid?}
    CheckSession -->|No| RedirectLogin[Redirect to Login]

    CheckSession -->|Yes| CheckExpiry{Token<br/>Expiring?}
    CheckExpiry -->|No| ContinueAction[Continue Action]

    CheckExpiry -->|Yes| RefreshToken[Attempt Token Refresh]
    RefreshToken --> RefreshSuccess{Refresh<br/>Success?}

    RefreshSuccess -->|Yes| NewToken[Issue New Tokens]
    NewToken --> UpdateSession[Update Session]
    UpdateSession --> ContinueAction

    RefreshSuccess -->|No| ExpiredSession[Session Expired]
    ExpiredSession --> ClearLocal[Clear Local Storage]
    ClearLocal --> RedirectLogin

    ContinueAction --> CompleteAction[Complete User Action]

    style Start fill:#e1f5ff
    style CompleteAction fill:#c8e6c9
    style RedirectLogin fill:#ffcccc
```

### 2. Account Recovery Flow

```mermaid
flowchart TD
    Start([Account Locked]) --> LoginAttempt[Failed Login Attempt]
    LoginAttempt --> ShowLocked[Show Account Locked]

    ShowLocked --> Options{Recovery<br/>Options}
    Options --> WaitTimeout[Wait 30 Minutes]
    Options --> EmailRecovery[Email Recovery]
    Options --> SupportTicket[Contact Support]

    WaitTimeout --> TimeExpired[Timeout Expired]
    TimeExpired --> CanLogin[Can Login Again]

    EmailRecovery --> SendCode[Send Recovery Code]
    SendCode --> EnterCode[Enter Recovery Code]
    EnterCode --> ValidateCode{Valid<br/>Code?}
    ValidateCode -->|No| RetryCode[Retry or Resend]
    ValidateCode -->|Yes| UnlockAccount[Unlock Account]

    SupportTicket --> CreateTicket[Create Support Ticket]
    CreateTicket --> VerifyIdentity[Identity Verification]
    VerifyIdentity --> SupportUnlock[Support Unlocks Account]

    UnlockAccount --> ResetRequired[Password Reset Required]
    SupportUnlock --> ResetRequired
    ResetRequired --> NewPassword[Set New Password]
    NewPassword --> CanLogin

    style Start fill:#ffcccc
    style CanLogin fill:#c8e6c9
```

## Onboarding Flows

### 1. Trainee Onboarding

```mermaid
flowchart TD
    Start([First Login]) --> Welcome[Welcome Modal]
    Welcome --> Tour{Take<br/>Tour?}

    Tour -->|Yes| GuidedTour[Guided Platform Tour]
    GuidedTour --> EndTour[Tour Complete]

    Tour -->|No| SkipTour[Skip to Dashboard]
    EndTour --> AssessmentPrompt[Suggest Initial Assessment]
    SkipTour --> AssessmentPrompt

    AssessmentPrompt --> TakeAssess{Take<br/>Assessment?}
    TakeAssess -->|Yes| Assessment[English Level Assessment]
    Assessment --> Results[Show Results & Level]
    Results --> Recommendations[Personalized Recommendations]

    TakeAssess -->|No| ExploreDash[Explore Dashboard]
    Recommendations --> ExploreDash

    ExploreDash --> ChooseModule[Choose First Module]
    ChooseModule --> StartLearning[Start Learning Journey]

    style Start fill:#e1f5ff
    style StartLearning fill:#c8e6c9
```

### 2. Company Onboarding

```mermaid
flowchart TD
    Start([Company First Login]) --> CompanyWelcome[Company Welcome]
    CompanyWelcome --> SetupWizard[Setup Wizard]

    SetupWizard --> Step1[Step 1: Company Profile]
    Step1 --> FillDetails[Complete Company Details]
    FillDetails --> Step2[Step 2: Requirements]

    Step2 --> DefineReqs[Define Hiring Requirements<br/>- Skills Needed<br/>- English Level<br/>- Experience]
    DefineReqs --> Step3[Step 3: Preferences]

    Step3 --> SetPrefs[Set Search Preferences<br/>- Auto-matching<br/>- Notifications<br/>- Filters]
    SetPrefs --> Step4[Step 4: Team]

    Step4 --> InviteTeam{Invite<br/>Team?}
    InviteTeam -->|Yes| SendInvites[Send Team Invitations]
    InviteTeam -->|No| SkipTeam[Skip for Now]

    SendInvites --> Complete[Setup Complete]
    SkipTeam --> Complete

    Complete --> FirstSearch[First Candidate Search]
    FirstSearch --> ViewCandidates[View Matching Candidates]

    style Start fill:#e1f5ff
    style ViewCandidates fill:#c8e6c9
```

## Error Handling Flows

### 1. Authentication Error Flow

```mermaid
flowchart TD
    Start([Error Occurs]) --> ErrorType{Error<br/>Type}

    ErrorType --> InvalidCreds[Invalid Credentials]
    ErrorType --> ExpiredToken[Expired Token]
    ErrorType --> NetworkError[Network Error]
    ErrorType --> ServerError[Server Error]

    InvalidCreds --> ShowError1[Show "Invalid email or password"]
    ShowError1 --> RetryLogin[Allow Retry]

    ExpiredToken --> ShowError2[Show "Session expired"]
    ShowError2 --> RedirectLogin[Redirect to Login]

    NetworkError --> ShowError3[Show "Connection failed"]
    ShowError3 --> RetryButton[Show Retry Button]
    RetryButton --> RetryAction[Retry Request]

    ServerError --> ShowError4[Show "Something went wrong"]
    ShowError4 --> LogError[Log Error Details]
    LogError --> SupportLink[Show Support Link]

    style Start fill:#ffcccc
```

## Mobile-Specific Flows

### 1. Mobile Authentication Flow

```mermaid
flowchart TD
    Start([Mobile User]) --> OpenApp[Open Mobile Browser]
    OpenApp --> LoadSite[Load HireXp Site]

    LoadSite --> MobileDetect[Detect Mobile Device]
    MobileDetect --> MobileLogin[Mobile-Optimized Login]

    MobileLogin --> Options{Auth<br/>Method}
    Options --> EmailPass[Email/Password]
    Options --> GoogleAuth[Google Auth]
    Options --> Biometric[Biometric Login<br/>(if saved)]

    EmailPass --> EnterCreds[Enter Credentials]
    GoogleAuth --> GoogleFlow[Google OAuth Flow]
    Biometric --> BiometricScan[Fingerprint/Face ID]

    EnterCreds --> Authenticate
    GoogleFlow --> Authenticate
    BiometricScan --> Authenticate[Authenticate User]

    Authenticate --> SaveSecure{Save<br/>Credentials?}
    SaveSecure -->|Yes| SecureStorage[Save to Secure Storage]
    SaveSecure -->|No| SessionOnly[Session Only]

    SecureStorage --> MobileDash[Mobile Dashboard]
    SessionOnly --> MobileDash

    style Start fill:#e1f5ff
    style MobileDash fill:#c8e6c9
```

## Compliance Flows

### 1. GDPR Consent Flow

```mermaid
flowchart TD
    Start([EU User Registration]) --> DetectLocation[Detect EU Location]
    DetectLocation --> ShowGDPR[Show GDPR Notice]

    ShowGDPR --> ConsentOptions[Present Consent Options<br/>- Essential Cookies<br/>- Analytics<br/>- Marketing]

    ConsentOptions --> UserChoice{User<br/>Selection}
    UserChoice --> SaveConsent[Save Consent Preferences]

    SaveConsent --> ContinueReg[Continue Registration]
    ContinueReg --> DataRights[Inform Data Rights<br/>- Access<br/>- Portability<br/>- Deletion]

    DataRights --> CompleteReg[Complete Registration]

    style Start fill:#e1f5ff
    style CompleteReg fill:#c8e6c9
```

## Integration Points

### With Training Modules
- Post-login redirect to last active module
- Session continuation across module switches
- Progress saves linked to user session

### With Progress Tracking
- Login triggers progress data load
- Logout saves current progress state
- Role changes affect visible progress metrics

### With Notification System
- Login triggers notification check
- Password changes send email alerts
- Role changes notify users immediately

## Best Practices

1. **Always show loading states** during authentication processes
2. **Provide clear error messages** with actionable next steps
3. **Implement retry mechanisms** for network failures
4. **Save user progress** before requiring re-authentication
5. **Use progressive disclosure** in registration forms
6. **Offer multiple authentication methods** for flexibility
7. **Maintain session across browser tabs**
8. **Clear sensitive data** on logout
9. **Implement proper back button handling**
10. **Test flows on multiple devices and browsers**