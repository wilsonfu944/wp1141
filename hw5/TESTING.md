# Testing Guide

This guide provides a comprehensive checklist to test all features of the X social platform.

## Prerequisites

- Application running locally or deployed
- At least 2 OAuth accounts for testing interactions
- All environment variables configured
- Database migrated and accessible

## Test Setup

### Create Test Users

1. Open application in **Browser 1** (Chrome)
   - Sign in with Google OAuth
   - Create userID: `testuser1`

2. Open application in **Browser 2** (Firefox/Safari/Incognito)
   - Sign in with GitHub OAuth
   - Create userID: `testuser2`

## Feature Testing Checklist

### 1. Authentication ✅

#### Sign In
- [ ] Click "Sign in" - redirects to `/auth/signin`
- [ ] See three OAuth buttons (Google, GitHub, Facebook)
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Facebook OAuth works

#### UserID Registration
- [ ] First-time login redirects to `/auth/register`
- [ ] Shows current email/name
- [ ] UserID input validates format:
  - [ ] Rejects < 3 characters
  - [ ] Rejects > 15 characters
  - [ ] Rejects special characters (except underscore)
  - [ ] Accepts alphanumeric + underscore
- [ ] Shows error if userID already taken
- [ ] Successfully creates userID and redirects to home

#### Session Management
- [ ] After login, stays logged in on refresh
- [ ] Session persists across browser restarts
- [ ] Can log out from user menu
- [ ] After logout, redirected to sign-in page

### 2. Navigation ✅

#### Sidebar
- [ ] Logo displays "𝕏"
- [ ] Home button navigates to `/home`
- [ ] Profile button navigates to own profile
- [ ] Post button opens post modal
- [ ] User info shows at bottom (avatar, name, userID)
- [ ] Three-dot menu shows logout option
- [ ] Active route is highlighted

### 3. Post Creation ✅

#### Post Modal (from sidebar)
- [ ] Opens on "Post" button click
- [ ] Shows user avatar
- [ ] Textarea autofocuses
- [ ] "X" button opens discard dialog
- [ ] "Drafts" button shows saved drafts

#### Character Counting
Test content: `Check this out! https://example.com/very-long-url-that-would-normally-be-way-more-than-23-characters #hashtag @mention`

- [ ] Regular text counts normally
- [ ] URLs count as 23 characters
- [ ] #hashtags don't count toward limit
- [ ] @mentions don't count toward limit
- [ ] Shows count like "45/280"
- [ ] Count turns red when > 280
- [ ] Post button disabled when > 280 or empty

#### Draft System
- [ ] Clicking "X" with content shows save dialog
- [ ] "Save" button saves draft and closes modal
- [ ] "Discard" button discards content
- [ ] "Drafts" button shows list of saved drafts
- [ ] Can click draft to load it
- [ ] Can delete individual drafts

#### Inline Post Composer (home feed)
- [ ] Shows at top of feed
- [ ] Expands when clicked
- [ ] Post button appears when content added
- [ ] Successfully posts without modal

### 4. Feed Display ✅

#### Tab Switching
- [ ] "All" tab shows all posts
- [ ] "Following" tab shows followed users' posts
- [ ] Tab indicator (blue underline) shows active tab
- [ ] Empty state shows appropriate message

#### Post Display
- [ ] Shows author avatar (clickable)
- [ ] Shows author name (clickable)
- [ ] Shows @userID (clickable)
- [ ] Shows relative timestamp:
  - [ ] "3s" for 3 seconds ago
  - [ ] "5m" for 5 minutes ago
  - [ ] "2h" for 2 hours ago
  - [ ] "3d" for 3 days ago
  - [ ] "Oct 23" for older (same year)
  - [ ] "Oct 23, 2023" for older (different year)
- [ ] Post content displays correctly
- [ ] URLs are clickable and styled blue
- [ ] #hashtags styled blue
- [ ] @mentions clickable (navigate to profile)

### 5. Post Interactions ✅

#### Like Functionality
- [ ] Click heart icon to like
- [ ] Heart turns red when liked
- [ ] Count increases immediately
- [ ] Click again to unlike
- [ ] Heart returns to gray
- [ ] Count decreases
- [ ] **Real-time**: Like in Browser 1, see count update in Browser 2

#### Repost Functionality
- [ ] Click repost icon
- [ ] Icon turns green when reposted
- [ ] Count increases
- [ ] Click again to unrepost
- [ ] Icon returns to gray
- [ ] Count decreases
- [ ] **Real-time**: Repost in Browser 1, see count update in Browser 2

#### Comment Functionality
- [ ] Click comment icon
- [ ] Navigate to post detail page
- [ ] Shows post at top with larger layout
- [ ] Can reply to post
- [ ] **Real-time**: Comment in Browser 1, see count update in Browser 2

#### Delete Functionality
- [ ] Three-dot menu shows on own posts only
- [ ] Click "..." shows dropdown with "Delete"
- [ ] Click Delete shows confirmation
- [ ] Confirming removes post
- [ ] Post disappears from feed

### 6. Post Detail & Comments ✅

#### Navigation
- [ ] Click any post to view detail
- [ ] URL changes to `/post/[id]`
- [ ] Back arrow returns to previous page
- [ ] Header shows "Post"

#### Comment Display
- [ ] Main post shows at top
- [ ] All comments listed below
- [ ] Each comment has full interaction buttons
- [ ] Empty state if no comments

#### Recursive Comments
- [ ] Click a comment navigates to `/post/[commentId]`
- [ ] Comment becomes the main "post"
- [ ] Its replies show as comments
- [ ] Can navigate infinitely deep
- [ ] Back arrow works at any level

### 7. Profile Pages ✅

#### Own Profile
- [ ] Click Profile in sidebar
- [ ] URL: `/profile/[yourUserId]`
- [ ] Shows banner image (or gray if none)
- [ ] Shows avatar (overlapping banner)
- [ ] Shows "Edit Profile" button
- [ ] Shows name and @userID
- [ ] Shows bio (if set)
- [ ] Shows join date
- [ ] Shows following/followers counts
- [ ] "Posts" tab shows your posts + reposts
- [ ] "Likes" tab visible and shows liked posts
- [ ] Privacy notice shown on Likes tab

#### Edit Profile
- [ ] Click "Edit Profile" opens modal
- [ ] Can edit name
- [ ] Can edit bio
- [ ] Can add/edit background image URL
- [ ] "Save Changes" updates profile
- [ ] Changes visible immediately

#### Other User's Profile
**In Browser 1:**
- [ ] Click @testuser2 in a post
- [ ] Navigate to their profile
- [ ] Shows "Follow" button (not "Edit Profile")
- [ ] No "Likes" tab visible
- [ ] Shows their posts
- [ ] Shows their follower/following counts

#### Follow/Unfollow
**In Browser 1:**
- [ ] Click "Follow" button
- [ ] Button changes to "Following"
- [ ] Follower count increases
- [ ] Click "Following" button
- [ ] Hover shows red styling
- [ ] Click to unfollow
- [ ] Button changes back to "Follow"
- [ ] Follower count decreases

**In Browser 2 (testuser2's profile):**
- [ ] See follower count increase when testuser1 follows
- [ ] See follower count decrease when testuser1 unfollows

### 8. Following Feed ✅

**Setup:**
1. Browser 1 (testuser1) follows testuser2
2. Browser 2 (testuser2) creates a post

**Test:**
- [ ] Browser 1 switches to "Following" tab
- [ ] See testuser2's post appear
- [ ] If testuser1 unfollows, post disappears from Following (after refresh)

### 9. Real-time Features (Pusher) ✅

**Open Browser 1 and Browser 2 side by side**

#### Like Real-time
- [ ] Browser 1: View a post
- [ ] Browser 2: Like that post
- [ ] Browser 1: See like count increase immediately (no refresh)

#### Comment Real-time
- [ ] Browser 1: View a post
- [ ] Browser 2: Comment on that post
- [ ] Browser 1: See comment count increase immediately

#### Multiple Users
- [ ] Have 3+ browser windows open
- [ ] All see same real-time updates
- [ ] Counts stay synchronized

### 10. Links & Mentions ✅

#### URL Handling
Post: `Check out https://github.com and http://google.com`

- [ ] Both URLs are clickable
- [ ] Styled in blue
- [ ] Open in new tab
- [ ] Count as 23 chars each in character limit

#### Hashtags
Post: `Testing #nextjs #typescript #tailwind`

- [ ] All hashtags styled blue
- [ ] Don't count toward character limit
- [ ] Visually distinct from regular text

#### Mentions
Post: `Hey @testuser1 and @testuser2 check this`

- [ ] @mentions styled blue
- [ ] Clickable (navigate to that user's profile)
- [ ] Don't count toward character limit
- [ ] Navigate to correct profile

### 11. Edge Cases ✅

#### Empty States
- [ ] New user with 0 posts shows "No posts yet"
- [ ] Following feed with 0 follows shows message
- [ ] Post with 0 comments shows "No comments yet"
- [ ] Likes tab with 0 likes shows message

#### Validation
- [ ] Can't create empty post
- [ ] Can't create post > 280 chars (after smart counting)
- [ ] Can't use invalid userID characters
- [ ] Can't use taken userID

#### Network Errors
- [ ] Graceful error handling on API failures
- [ ] Optimistic UI updates (reverts on error)

#### Race Conditions
- [ ] Double-clicking like doesn't break
- [ ] Rapid like/unlike stays consistent
- [ ] Multiple simultaneous actions work

### 12. UI/UX ✅

#### Visual Design
- [ ] Dark theme throughout
- [ ] Consistent spacing and typography
- [ ] Hover states on interactive elements
- [ ] Active states on navigation
- [ ] Loading states where appropriate

#### Responsiveness
- [ ] Test on mobile viewport (DevTools)
- [ ] Layout adapts appropriately
- [ ] Touch targets adequately sized
- [ ] Scrolling works smoothly

#### Performance
- [ ] Pages load quickly
- [ ] No layout shift
- [ ] Smooth animations
- [ ] Real-time updates don't lag

## Browser Compatibility

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing (Optional)

If deploying:
- [ ] Test on actual mobile device
- [ ] Touch interactions work
- [ ] Virtual keyboard doesn't break layout
- [ ] OAuth works on mobile

## Security Testing

- [ ] Can't delete other users' posts
- [ ] Can't edit other users' profiles
- [ ] Can't see other users' liked posts
- [ ] API routes require authentication
- [ ] Session tokens are secure

## Performance Testing

- [ ] Feed loads with 50+ posts without lag
- [ ] Real-time updates with multiple users
- [ ] Profile with many posts loads quickly
- [ ] Image loading doesn't block rendering

## Bug Reporting Template

If you find issues, document them:

```
**Bug**: [Brief description]
**Steps to Reproduce**:
1. ...
2. ...
**Expected**: [What should happen]
**Actual**: [What actually happens]
**Browser**: [Chrome 120 / Firefox 121 / etc.]
**Console Errors**: [Any errors in browser console]
```

## Test Results Summary

After completing all tests:

```
✅ Authentication: [ ] Pass [ ] Fail
✅ Navigation: [ ] Pass [ ] Fail
✅ Post Creation: [ ] Pass [ ] Fail
✅ Feed Display: [ ] Pass [ ] Fail
✅ Interactions: [ ] Pass [ ] Fail
✅ Comments: [ ] Pass [ ] Fail
✅ Profiles: [ ] Pass [ ] Fail
✅ Following: [ ] Pass [ ] Fail
✅ Real-time: [ ] Pass [ ] Fail
✅ UI/UX: [ ] Pass [ ] Fail
```

**Total: ___/10 features working**

## Automated Testing (Future)

Consider adding:
- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Playwright or Cypress
- API tests with Supertest






