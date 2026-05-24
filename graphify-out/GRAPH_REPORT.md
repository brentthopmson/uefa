# Graph Report - c:\Users\HP\Desktop\ZIPPER\WEBFIXX\DEV\Extra Tools\uefa  (2026-05-23)

## Corpus Check
- 67 files · ~166,125 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 133 nodes · 123 edges · 8 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin & User Table UI|Admin & User Table UI]]
- [[_COMMUNITY_Google Sheets Database|Google Sheets Database]]
- [[_COMMUNITY_User Account Services|User Account Services]]
- [[_COMMUNITY_App Shell Layout|App Shell Layout]]
- [[_COMMUNITY_Ticket & Transfer UI Pages|Ticket & Transfer UI Pages]]
- [[_COMMUNITY_Google Drive Service|Google Drive Service]]
- [[_COMMUNITY_User Account Services|User Account Services]]
- [[_COMMUNITY_Admin & User Table UI|Admin & User Table UI]]

## God Nodes (most connected - your core abstractions)
1. `useUser()` - 17 edges
2. `GoogleSheetService` - 11 edges
3. `UserService` - 10 edges
4. `GoogleDriveService` - 5 edges
5. `UserProvider()` - 3 edges
6. `run_tests()` - 2 edges
7. `UserRegisterRequest` - 2 edges
8. `UserLoginRequest` - 2 edges
9. `VerifyAccountRequest` - 2 edges
10. `fetchAdmins()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --calls--> `useUser()`  [INFERRED]
  app/login/page.tsx → app/UserContext.tsx

## Communities (30 total, 7 thin omitted)

### Community 9 - "User Account Services"
Cohesion: 0.6
Nodes (4): BaseModel, UserLoginRequest, UserRegisterRequest, VerifyAccountRequest

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useUser()` connect `Admin & User Table UI` to `App Shell Layout`, `Add Ticket Form UI`, `Ticket & Transfer UI Pages`, `Module: Components_Addusermodal`, `Module: Components_Transfermodal`, `Module: Secure_Myaccount_Personal_Details_Page`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `UserService` connect `User Account Services` to `User Account Services`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Should `Admin & User Table UI` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._