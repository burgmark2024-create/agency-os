# Agency OS — Deploy to Vercel in 10 Minutes

## What's in this folder

```
agency-os/
├── public/
│   └── index.html        ← HTML shell
├── src/
│   ├── index.js          ← React entry point
│   └── App.jsx           ← Your full dashboard (all 8 modules)
├── package.json          ← Dependencies
└── README.md             ← This file
```

---

## Step-by-Step: Deploy Live (Zero Code)

### Step 1 — Create a GitHub account
Go to **github.com** and sign up (free).

### Step 2 — Create a new repository
1. Click the **+** icon → "New repository"
2. Name it: `agency-os`
3. Set to **Public**
4. Click **Create repository**

### Step 3 — Upload your files
1. Click **"Add file"** → **"Upload files"**
2. Drag the entire `agency-os` folder contents into the upload area
3. Click **"Commit changes"**

### Step 4 — Deploy on Vercel
1. Go to **vercel.com** → Sign in with GitHub
2. Click **"Add New Project"**
3. Select your `agency-os` repository
4. Framework: select **Create React App**
5. Click **Deploy**

### Step 5 — You're live!
Your dashboard is now live at:
`https://agency-os-[yourname].vercel.app`

Share this URL with agencies. Works on desktop and mobile.

---

## Connecting to the Automation Stack

| Tool | Purpose | Link |
|------|---------|------|
| Airtable | Save leads & agency data | airtable.com |
| Brevo | Send email sequences | brevo.com |
| Make.com | Connect Airtable → Brevo | make.com |
| Waalaxy | LinkedIn outreach | waalaxy.com |

See the full setup guide (Agency-OS-Playbook.docx) for step-by-step instructions.

---

## Updating your dashboard

When you want to make changes:
1. Edit `src/App.jsx` locally
2. Go to your GitHub repo → click the file → click the pencil (edit) icon
3. Paste your updated code → Commit
4. Vercel auto-redeploys in ~60 seconds

---

Built with React + Claude API. Zero monthly cost until scale.
