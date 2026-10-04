BEGIN;
INSERT INTO "Organization" ("id", "slug", "name", "branding", "settings", "createdAt", "updatedAt") VALUES
  ('cb06a7106e9eeefb46b3471b', 'grace-community', 'Grace Community Church',
   '{"primary":"#181818","secondary":"#6A6A6A"}',
   '{"timezone":"Africa/Nairobi","defaultReminderHoursBefore":24}',
   '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "AdminUser" ("id", "orgId", "email", "name", "passwordHash", "role", "createdAt", "updatedAt") VALUES
  ('1c5ae7dd85bff378c4fd2814', 'cb06a7106e9eeefb46b3471b', 'admin@grace.community', 'Grace Admin', '$2b$10$ji5mdSQ56kXWhYHEIuhxE.7d5FUggxK56NXk9Z1Zkk/GnNWunzdP6', 'admin', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Household" ("id", "orgId", "name", "address", "createdAt", "updatedAt") VALUES
    ('1f7fb58fc270648d370ca70f', 'cb06a7106e9eeefb46b3471b', 'Mwangi Household', '12 Karura Rd, Nairobi', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Household" ("id", "orgId", "name", "address", "createdAt", "updatedAt") VALUES
    ('054ec0be5b2c7463d6a7f8f2', 'cb06a7106e9eeefb46b3471b', 'Ochieng Household', '45 Milimani Rd, Kisumu', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Household" ("id", "orgId", "name", "address", "createdAt", "updatedAt") VALUES
    ('7f61743bdc91f9639f926dc2', 'cb06a7106e9eeefb46b3471b', 'Wanjiru Household', '78 Thika Rd, Nairobi', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Household" ("id", "orgId", "name", "address", "createdAt", "updatedAt") VALUES
    ('2def06ea6363db0c788a6ed6', 'cb06a7106e9eeefb46b3471b', 'Kamau Household', '3 Ngong Rd, Nairobi', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Household" ("id", "orgId", "name", "address", "createdAt", "updatedAt") VALUES
    ('53eb2195493842edc47a0606', 'cb06a7106e9eeefb46b3471b', 'Achieng Household', '9 Luthuli Ave, Mombasa', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('1b8c4090c0f4b3824809f893', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'James', 'Mwangi',
     'james.mwangi0@grace.community',
     '+254710000000',
     '12 Karura Rd, Nairobi', 'male', 'single',
     'active', '1970-01-01 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('34f58c950697d89fd853a919', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Mary', 'Ochieng',
     'mary.ochieng1@grace.community',
     '+254710000137',
     '45 Milimani Rd, Kisumu', 'female', 'married',
     'active', '1971-02-02 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('b84b4e0f29999922e771de6e', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'John', 'Wanjiru',
     'john.wanjiru2@grace.community',
     '+254710000274',
     '78 Thika Rd, Nairobi', 'male', 'married',
     'active', '1972-03-03 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('425482f8e58de493ccc54316', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Grace', 'Kamau',
     'grace.kamau3@grace.community',
     '+254710000411',
     '3 Ngong Rd, Nairobi', 'female', 'married',
     'active', '1973-04-04 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('b684c0ae49bcecca26a3eb82', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Peter', 'Achieng',
     'peter.achieng4@grace.community',
     '+254710000548',
     '9 Luthuli Ave, Mombasa', 'male', 'single',
     'visitor', '1974-05-05 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('79200677a14aea850d03684a', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Ruth', 'Otieno',
     'ruth.otieno5@grace.community',
     '+254710000685',
     '12 Karura Rd, Nairobi', 'female', 'married',
     'inactive', '1975-06-06 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('9feb413ed78a3d294a08253d', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Paul', 'Njoroge',
     'paul.njoroge6@grace.community',
     '+254710000822',
     '45 Milimani Rd, Kisumu', 'male', 'married',
     'active', '1976-07-07 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('331224d9de0d0e0468434f1c', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Esther', 'Akinyi',
     'esther.akinyi7@grace.community',
     '+254710000959',
     '78 Thika Rd, Nairobi', 'female', 'married',
     'active', '1977-08-08 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('6600e5123058f8716f182931', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'David', 'Kariuki',
     'david.kariuki8@grace.community',
     '+254710001096',
     '3 Ngong Rd, Nairobi', 'male', 'single',
     'active', '1978-09-09 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('cddf8b1dfd7abef0363aab8c', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Sarah', 'Wambui',
     'sarah.wambui9@grace.community',
     '+254710001233',
     '9 Luthuli Ave, Mombasa', 'female', 'married',
     'active', '1979-10-10 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('c37825a7aab3bf249e88ccb2', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Joseph', 'Maina',
     'joseph.maina10@grace.community',
     '+254710001370',
     '12 Karura Rd, Nairobi', 'male', 'married',
     'visitor', '1980-11-11 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('1f614a022be735b859b4c57d', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Hannah', 'Njeri',
     'hannah.njeri11@grace.community',
     '+254710001507',
     '45 Milimani Rd, Kisumu', 'female', 'married',
     'inactive', '1981-12-12 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('8e3826ca094e2a32af591ecd', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Daniel', 'Chege',
     'daniel.chege12@grace.community',
     '+254710001644',
     '78 Thika Rd, Nairobi', 'male', 'single',
     'active', '1982-01-13 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('0ffeae5d0568e67a46a55034', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Rebecca', 'Wangari',
     'rebecca.wangari13@grace.community',
     '+254710001781',
     '3 Ngong Rd, Nairobi', 'female', 'married',
     'active', '1983-02-14 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('2cc63a0a17d5742a28c9b396', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Samuel', 'Gitau',
     'samuel.gitau14@grace.community',
     '+254710001918',
     '9 Luthuli Ave, Mombasa', 'male', 'married',
     'active', '1984-03-15 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('707a1d9defa92611df5f1252', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Rachel', 'Nduta',
     'rachel.nduta15@grace.community',
     '+254710002055',
     '12 Karura Rd, Nairobi', 'female', 'married',
     'active', '1985-04-16 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('1bc1e6ba6648a3c8908e82ce', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Isaac', 'Mburu',
     'isaac.mburu16@grace.community',
     '+254710002192',
     '45 Milimani Rd, Kisumu', 'male', 'single',
     'visitor', '1986-05-17 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('3e4fc0445408e5a9cae678ff', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Miriam', 'Nyambura',
     'miriam.nyambura17@grace.community',
     '+254710002329',
     '78 Thika Rd, Nairobi', 'female', 'married',
     'inactive', '1987-06-18 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('5ac5e847a26a4c26890449b1', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Moses', 'Kibe',
     'moses.kibe18@grace.community',
     '+254710002466',
     '3 Ngong Rd, Nairobi', 'male', 'married',
     'active', '1988-07-19 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('b868ecf74d22c94e49b63cf8', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Deborah', 'Muthoni',
     'deborah.muthoni19@grace.community',
     '+254710002603',
     '9 Luthuli Ave, Mombasa', 'female', 'married',
     'active', '1989-08-20 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('88e494949d3f6b76814e6584', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Joshua', 'Mwangi',
     'joshua.mwangi20@grace.community',
     '+254710002740',
     '12 Karura Rd, Nairobi', 'male', 'single',
     'active', '1990-09-21 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('7905a427d5d4b7b4f321d8b4', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Naomi', 'Ochieng',
     'naomi.ochieng21@grace.community',
     '+254710002877',
     '45 Milimani Rd, Kisumu', 'female', 'married',
     'active', '1991-10-22 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('d83310009709dc4a67b90f4c', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Elijah', 'Wanjiru',
     'elijah.wanjiru22@grace.community',
     '+254710003014',
     '78 Thika Rd, Nairobi', 'male', 'married',
     'visitor', '1992-11-23 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('356c002a1d0aa559d47be858', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Abigail', 'Kamau',
     'abigail.kamau23@grace.community',
     '+254710003151',
     '3 Ngong Rd, Nairobi', 'female', 'married',
     'inactive', '1993-12-24 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('479ab3755e9b310cc0f966c7', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Nathan', 'Achieng',
     'nathan.achieng24@grace.community',
     '+254710003288',
     '9 Luthuli Ave, Mombasa', 'male', 'single',
     'active', '1994-01-25 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('537420bbd77eee69fae8bcbe', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Leah', 'Otieno',
     'leah.otieno25@grace.community',
     '+254710003425',
     '12 Karura Rd, Nairobi', 'female', 'married',
     'active', '1995-02-26 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('2d3efba5715952f693b2cd7f', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Ethan', 'Njoroge',
     'ethan.njoroge26@grace.community',
     '+254710003562',
     '45 Milimani Rd, Kisumu', 'male', 'married',
     'active', '1996-03-27 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('0cdf560aca5ba12e3b3a210d', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Martha', 'Akinyi',
     'martha.akinyi27@grace.community',
     '+254710003699',
     '78 Thika Rd, Nairobi', 'female', 'married',
     'active', '1997-04-01 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('c92b45917fd2cf7aedea1745', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Caleb', 'Kariuki',
     'caleb.kariuki28@grace.community',
     '+254710003836',
     '3 Ngong Rd, Nairobi', 'male', 'single',
     'visitor', '1998-05-02 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('e61b9bb59b396b21dfabecd0', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Elizabeth', 'Wambui',
     'elizabeth.wambui29@grace.community',
     '+254710003973',
     '9 Luthuli Ave, Mombasa', 'female', 'married',
     'inactive', '1999-06-03 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('3e165ae5bb833d0fa7adc35a', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Aaron', 'Maina',
     'aaron.maina30@grace.community',
     '+254710004110',
     '12 Karura Rd, Nairobi', 'male', 'married',
     'active', '2000-07-04 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('49b6767ba8601008a8a2b841', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Anna', 'Njeri',
     'anna.njeri31@grace.community',
     '+254710004247',
     '45 Milimani Rd, Kisumu', 'female', 'married',
     'active', '2001-08-05 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('1ef9fc5bbcebb688b3ec65c1', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Gideon', 'Chege',
     'gideon.chege32@grace.community',
     '+254710004384',
     '78 Thika Rd, Nairobi', 'male', 'single',
     'active', '2002-09-06 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('be968fb29501dc97030f2560', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Julia', 'Wangari',
     'julia.wangari33@grace.community',
     '+254710004521',
     '3 Ngong Rd, Nairobi', 'female', 'married',
     'active', '2003-10-07 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('1d462a200597204b7d6cb3bd', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Solomon', 'Gitau',
     'solomon.gitau34@grace.community',
     '+254710004658',
     '9 Luthuli Ave, Mombasa', 'male', 'married',
     'visitor', '2004-11-08 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('c8a55065fd87e2d4d834095a', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Priscilla', 'Nduta',
     'priscilla.nduta35@grace.community',
     '+254710004795',
     '12 Karura Rd, Nairobi', 'female', 'married',
     'inactive', '2005-12-09 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('44ce5c8d165507d3ad638810', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Reuben', 'Mburu',
     'reuben.mburu36@grace.community',
     '+254710004932',
     '45 Milimani Rd, Kisumu', 'male', 'single',
     'active', '2006-01-10 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('411a04c70732e14ea859dd10', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Dorcas', 'Nyambura',
     'dorcas.nyambura37@grace.community',
     '+254710005069',
     '78 Thika Rd, Nairobi', 'female', 'married',
     'active', '2007-02-11 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('f081ae454f2d4c73fe1114a4', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Simeon', 'Kibe',
     'simeon.kibe38@grace.community',
     '+254710005206',
     '3 Ngong Rd, Nairobi', 'male', 'married',
     'active', '2008-03-12 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('368ed109035e1c8b663ed848', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Lois', 'Muthoni',
     'lois.muthoni39@grace.community',
     '+254710005343',
     '9 Luthuli Ave, Mombasa', 'female', 'married',
     'active', '2009-04-13 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('2210f39f4d6d9cf1ab0fe621', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Benjamin', 'Mwangi',
     'benjamin.mwangi40@grace.community',
     '+254710005480',
     '12 Karura Rd, Nairobi', 'male', 'single',
     'visitor', '2010-05-14 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('c7cfc176857be5bc0c2bf6b9', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Rhoda', 'Ochieng',
     'rhoda.ochieng41@grace.community',
     '+254710005617',
     '45 Milimani Rd, Kisumu', 'female', 'married',
     'inactive', '2011-06-15 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('bf92230c10d35f68e14aa333', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Zechariah', 'Wanjiru',
     'zechariah.wanjiru42@grace.community',
     '+254710005754',
     '78 Thika Rd, Nairobi', 'male', 'married',
     'active', '2012-07-16 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('1546aa2c6b7054534b83b061', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Tabitha', 'Kamau',
     'tabitha.kamau43@grace.community',
     '+254710005891',
     '3 Ngong Rd, Nairobi', 'female', 'married',
     'active', '2013-08-17 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('d2e54e9b47f8c2fbd16576ae', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Joel', 'Achieng',
     'joel.achieng44@grace.community',
     '+254710006028',
     '9 Luthuli Ave, Mombasa', 'male', 'single',
     'active', '2014-09-18 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('86ec24d8b237bdedfd9e2f84', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Bilhah', 'Otieno',
     'bilhah.otieno45@grace.community',
     '+254710006165',
     '12 Karura Rd, Nairobi', 'female', 'married',
     'active', '1970-10-19 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('f5cfa9bbc686abd2d7cd8a61', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Amos', 'Njoroge',
     'amos.njoroge46@grace.community',
     '+254710006302',
     '45 Milimani Rd, Kisumu', 'male', 'married',
     'visitor', '1971-11-20 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('e10d6177321243fc1ca26f79', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Keren', 'Akinyi',
     'keren.akinyi47@grace.community',
     '+254710006439',
     '78 Thika Rd, Nairobi', 'female', 'married',
     'inactive', '1972-12-21 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('c4021a71bd61e6bb43412fd2', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Obadiah', 'Kariuki',
     'obadiah.kariuki48@grace.community',
     '+254710006576',
     '3 Ngong Rd, Nairobi', 'male', 'single',
     'active', '1973-01-22 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('55b8706aaa3bb373d84cdefb', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Susanna', 'Wambui',
     'susanna.wambui49@grace.community',
     '+254710006713',
     '9 Luthuli Ave, Mombasa', 'female', 'married',
     'active', '1974-02-23 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('60ac494c696fc402db04908b', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Micah', 'Maina',
     'micah.maina50@grace.community',
     '+254710006850',
     '12 Karura Rd, Nairobi', 'male', 'married',
     'active', '1975-03-24 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('12252401b571865fbc3e5aff', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Tamar', 'Njeri',
     'tamar.njeri51@grace.community',
     '+254710006987',
     '45 Milimani Rd, Kisumu', 'female', 'married',
     'active', '1976-04-25 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('b8684299f4a18d693b155d48', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Nahum', 'Chege',
     'nahum.chege52@grace.community',
     '+254710007124',
     '78 Thika Rd, Nairobi', 'male', 'single',
     'visitor', '1977-05-26 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('8766b3f03dbc34023af5871c', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Vashti', 'Wangari',
     'vashti.wangari53@grace.community',
     '+254710007261',
     '3 Ngong Rd, Nairobi', 'female', 'married',
     'inactive', '1978-06-27 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('df18a38e6f5561a16bd1e96a', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Zephaniah', 'Gitau',
     'zephaniah.gitau54@grace.community',
     '+254710007398',
     '9 Luthuli Ave, Mombasa', 'male', 'married',
     'active', '1979-07-01 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('dfeea7301df359e7ca736914', 'cb06a7106e9eeefb46b3471b', '1f7fb58fc270648d370ca70f', 'Jemimah', 'Nduta',
     'jemimah.nduta55@grace.community',
     '+254710007535',
     '12 Karura Rd, Nairobi', 'female', 'married',
     'active', '1980-08-02 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('5e5b3aeb3f2fa1de1b527678', 'cb06a7106e9eeefb46b3471b', '054ec0be5b2c7463d6a7f8f2', 'Haggai', 'Mburu',
     'haggai.mburu56@grace.community',
     '+254710007672',
     '45 Milimani Rd, Kisumu', 'male', 'single',
     'active', '1981-09-03 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('ad9652d6681f945d2a919c46', 'cb06a7106e9eeefb46b3471b', '7f61743bdc91f9639f926dc2', 'Keziah', 'Nyambura',
     'keziah.nyambura57@grace.community',
     '+254710007809',
     '78 Thika Rd, Nairobi', 'female', 'married',
     'active', '1982-10-04 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('9e276b2295591013876f82be', 'cb06a7106e9eeefb46b3471b', '2def06ea6363db0c788a6ed6', 'Malachi', 'Kibe',
     'malachi.kibe58@grace.community',
     '+254710007946',
     '3 Ngong Rd, Nairobi', 'male', 'married',
     'visitor', '1983-11-05 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Member" ("id", "orgId", "householdId", "firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth", "joinedAt", "createdAt", "updatedAt") VALUES
    ('e10e170c73d9b574d5fe3e97', 'cb06a7106e9eeefb46b3471b', '53eb2195493842edc47a0606', 'Claudia', 'Muthoni',
     'claudia.muthoni59@grace.community',
     '+254710008083',
     '9 Luthuli Ave, Mombasa', 'female', 'married',
     'inactive', '1984-12-06 00:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
UPDATE "Household" SET "headMemberId" = '1b8c4090c0f4b3824809f893' WHERE "id" = '1f7fb58fc270648d370ca70f';
UPDATE "Household" SET "headMemberId" = '34f58c950697d89fd853a919' WHERE "id" = '054ec0be5b2c7463d6a7f8f2';
UPDATE "Household" SET "headMemberId" = 'b84b4e0f29999922e771de6e' WHERE "id" = '7f61743bdc91f9639f926dc2';
UPDATE "Household" SET "headMemberId" = '425482f8e58de493ccc54316' WHERE "id" = '2def06ea6363db0c788a6ed6';
UPDATE "Household" SET "headMemberId" = 'b684c0ae49bcecca26a3eb82' WHERE "id" = '53eb2195493842edc47a0606';
INSERT INTO "Group" ("id", "orgId", "name", "description", "category", "createdAt", "updatedAt") VALUES
    ('535dc5080cd99a68b3be504a', 'cb06a7106e9eeefb46b3471b', 'Worship Team', 'Sunday worship leading', 'ministry', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Group" ("id", "orgId", "name", "description", "category", "createdAt", "updatedAt") VALUES
    ('ef4e09caf913ce3a221cbcbd', 'cb06a7106e9eeefb46b3471b', 'Ushers', 'Service ushering', 'ministry', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Group" ("id", "orgId", "name", "description", "category", "createdAt", "updatedAt") VALUES
    ('260bb1835fc2d5d73b017091', 'cb06a7106e9eeefb46b3471b', 'Children''s Ministry', 'Sunday school', 'ministry', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Group" ("id", "orgId", "name", "description", "category", "createdAt", "updatedAt") VALUES
    ('fc09ad4e5aa9d84c6dbea270', 'cb06a7106e9eeefb46b3471b', 'Greeters', 'Welcome team', 'ministry', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Group" ("id", "orgId", "name", "description", "category", "createdAt", "updatedAt") VALUES
    ('ef10f49660024500ad021926', 'cb06a7106e9eeefb46b3471b', 'Youth Fellowship', 'Teens & young adults', 'smallgroup', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Group" ("id", "orgId", "name", "description", "category", "createdAt", "updatedAt") VALUES
    ('1a5af182f689d0ed08bbdef8', 'cb06a7106e9eeefb46b3471b', 'Women''s Fellowship', 'Women''s Bible study', 'smallgroup', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Group" ("id", "orgId", "name", "description", "category", "createdAt", "updatedAt") VALUES
    ('08d771a076dbb24fa073a645', 'cb06a7106e9eeefb46b3471b', 'Men''s Fellowship', 'Men''s discipleship', 'smallgroup', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Group" ("id", "orgId", "name", "description", "category", "createdAt", "updatedAt") VALUES
    ('a65472af55fdedd556d28d18', 'cb06a7106e9eeefb46b3471b', 'Outreach Committee', 'Missions & community', 'committee', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('6aacda2e0197612c2a52b2e2', '1b8c4090c0f4b3824809f893', '535dc5080cd99a68b3be504a', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('e0bf7cec92f414bc668f6d6d', '34f58c950697d89fd853a919', 'ef4e09caf913ce3a221cbcbd', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('68bf9defd434ce7f8dc191d0', 'b84b4e0f29999922e771de6e', '260bb1835fc2d5d73b017091', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('8d3fa261dccd101ec7cdbc3d', '425482f8e58de493ccc54316', 'fc09ad4e5aa9d84c6dbea270', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('8cc49cd7dc9ba10222ab4955', 'b684c0ae49bcecca26a3eb82', 'ef10f49660024500ad021926', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('97b665795f2dc64dc561ee3b', '79200677a14aea850d03684a', '1a5af182f689d0ed08bbdef8', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('dae855d1b618c0ee3721c992', '9feb413ed78a3d294a08253d', '08d771a076dbb24fa073a645', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('853efc5a75b59aba8b3cd754', '331224d9de0d0e0468434f1c', 'a65472af55fdedd556d28d18', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('d8d1c6ce5e152fb3a698dcd8', '6600e5123058f8716f182931', '535dc5080cd99a68b3be504a', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('345d052b555b22ab9aa6432d', 'cddf8b1dfd7abef0363aab8c', 'ef4e09caf913ce3a221cbcbd', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('d7e59679205a5df9e2f0bacb', 'c37825a7aab3bf249e88ccb2', '260bb1835fc2d5d73b017091', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('7e7e76a362f76064ba2f4d85', '1f614a022be735b859b4c57d', 'fc09ad4e5aa9d84c6dbea270', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('a19374f61cadc8b8c2721f8a', '8e3826ca094e2a32af591ecd', 'ef10f49660024500ad021926', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('93efea736d01f771c590bf72', '0ffeae5d0568e67a46a55034', '1a5af182f689d0ed08bbdef8', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('244d15c62366474fe5387a0d', '2cc63a0a17d5742a28c9b396', '08d771a076dbb24fa073a645', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('1b395038b183abab58e3a9b0', '707a1d9defa92611df5f1252', 'a65472af55fdedd556d28d18', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('1c51b69ae4e438d77283db5b', '1bc1e6ba6648a3c8908e82ce', '535dc5080cd99a68b3be504a', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('809fd7e04876bb1c2aa16e6e', '3e4fc0445408e5a9cae678ff', 'ef4e09caf913ce3a221cbcbd', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('85d9c13ecfbc379d530173d7', '5ac5e847a26a4c26890449b1', '260bb1835fc2d5d73b017091', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('58e76568a3b83c6570f21822', 'b868ecf74d22c94e49b63cf8', 'fc09ad4e5aa9d84c6dbea270', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('3ae1408c6a7a5a2e5d385d3f', '88e494949d3f6b76814e6584', 'ef10f49660024500ad021926', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('f68be3cecf8f5338351012cf', '7905a427d5d4b7b4f321d8b4', '1a5af182f689d0ed08bbdef8', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('65af2cb185ac377d9b1e9a8d', 'd83310009709dc4a67b90f4c', '08d771a076dbb24fa073a645', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('373533be24280ae7970d98c7', '356c002a1d0aa559d47be858', 'a65472af55fdedd556d28d18', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('9ea104ef43c7c1aad799ceee', '479ab3755e9b310cc0f966c7', '535dc5080cd99a68b3be504a', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('9430089daa09bc0380de4448', '537420bbd77eee69fae8bcbe', 'ef4e09caf913ce3a221cbcbd', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('905e4ce20f91650a506fc7fa', '2d3efba5715952f693b2cd7f', '260bb1835fc2d5d73b017091', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('829d2c24d4302fa39d429132', '0cdf560aca5ba12e3b3a210d', 'fc09ad4e5aa9d84c6dbea270', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('bca7b2a91423a798429faeba', 'c92b45917fd2cf7aedea1745', 'ef10f49660024500ad021926', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('e68e4337f65a708c628e4673', 'e61b9bb59b396b21dfabecd0', '1a5af182f689d0ed08bbdef8', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('0fffa4f55f27e4a65a48dfa5', '3e165ae5bb833d0fa7adc35a', '08d771a076dbb24fa073a645', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('126d8c62961e4d7356a5403f', '49b6767ba8601008a8a2b841', 'a65472af55fdedd556d28d18', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('837239cfc0ed2e1c7926d529', '1ef9fc5bbcebb688b3ec65c1', '535dc5080cd99a68b3be504a', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('c9b90192082c575f65081011', 'be968fb29501dc97030f2560', 'ef4e09caf913ce3a221cbcbd', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('f9ed33d73c16e3dc9b3da109', '1d462a200597204b7d6cb3bd', '260bb1835fc2d5d73b017091', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('d347c161b06583e4722b19c1', 'c8a55065fd87e2d4d834095a', 'fc09ad4e5aa9d84c6dbea270', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('ad2e3973b9ea69c6ba90431b', '44ce5c8d165507d3ad638810', 'ef10f49660024500ad021926', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('fe70c31b1c7ebb031b953de1', '411a04c70732e14ea859dd10', '1a5af182f689d0ed08bbdef8', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('f89e46d59c1d1ad7001858c6', 'f081ae454f2d4c73fe1114a4', '08d771a076dbb24fa073a645', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('b610f4428b1c483a568b8b91', '368ed109035e1c8b663ed848', 'a65472af55fdedd556d28d18', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('71c3a291c5f72b8fdb6d3371', '2210f39f4d6d9cf1ab0fe621', '535dc5080cd99a68b3be504a', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('b2d5858879dc9abcac3857cd', 'c7cfc176857be5bc0c2bf6b9', 'ef4e09caf913ce3a221cbcbd', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('9c8e7960fc7acfafe7dd4145', 'bf92230c10d35f68e14aa333', '260bb1835fc2d5d73b017091', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('49b6fca53264dd17a1754db6', '1546aa2c6b7054534b83b061', 'fc09ad4e5aa9d84c6dbea270', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('2da20d50bc2fd59acb2e2138', 'd2e54e9b47f8c2fbd16576ae', 'ef10f49660024500ad021926', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('d6a7e304091d8826beede118', '86ec24d8b237bdedfd9e2f84', '1a5af182f689d0ed08bbdef8', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('708646e2fec933e971db8e46', 'f5cfa9bbc686abd2d7cd8a61', '08d771a076dbb24fa073a645', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('020961da76b430d3c75615f8', 'e10d6177321243fc1ca26f79', 'a65472af55fdedd556d28d18', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('80cbd444c33fcc5b579402e1', 'c4021a71bd61e6bb43412fd2', '535dc5080cd99a68b3be504a', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('7c1c5f0f172e580aa682c0bf', '55b8706aaa3bb373d84cdefb', 'ef4e09caf913ce3a221cbcbd', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('ea9901b398bdc151eb61ce6e', '60ac494c696fc402db04908b', '260bb1835fc2d5d73b017091', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('9c6db4d158564a22b5520552', '12252401b571865fbc3e5aff', 'fc09ad4e5aa9d84c6dbea270', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('00454182e45653f81287c51f', 'b8684299f4a18d693b155d48', 'ef10f49660024500ad021926', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('3233d2be950a5c73b9e63f84', '8766b3f03dbc34023af5871c', '1a5af182f689d0ed08bbdef8', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('f7b8d6830deed528174c4bad', 'df18a38e6f5561a16bd1e96a', '08d771a076dbb24fa073a645', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('79896e13911e0daf4e97383a', 'dfeea7301df359e7ca736914', 'a65472af55fdedd556d28d18', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('4229fd96a903cd56731577b3', '5e5b3aeb3f2fa1de1b527678', '535dc5080cd99a68b3be504a', 'leader', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('9c9e0ee8217c15d6698fe1e2', 'ad9652d6681f945d2a919c46', 'ef4e09caf913ce3a221cbcbd', 'volunteer', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('70f6b15322292e0be03b8564', '9e276b2295591013876f82be', '260bb1835fc2d5d73b017091', 'member', '2026-08-30 22:32:15');
INSERT INTO "Membership" ("id", "memberId", "groupId", "role", "joinedAt") VALUES
    ('d18e82160eed297736639122', 'e10e170c73d9b574d5fe3e97', 'fc09ad4e5aa9d84c6dbea270', 'member', '2026-08-30 22:32:15');
INSERT INTO "SermonSeries" ("id", "orgId", "name", "description", "createdAt", "updatedAt") VALUES
    ('58bcdfe3ddb34af5e4692414', 'cb06a7106e9eeefb46b3471b', 'Foundations of Faith', 'A walk through core Christian doctrines', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "SermonSeries" ("id", "orgId", "name", "description", "createdAt", "updatedAt") VALUES
    ('8ccc4587fda7c70c284fb2ae', 'cb06a7106e9eeefb46b3471b', 'The Sermon on the Mount', 'Jesus'' teachings in Matthew 5-7', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "SermonSeries" ("id", "orgId", "name", "description", "createdAt", "updatedAt") VALUES
    ('b3d175f75f23498844d4d972', 'cb06a7106e9eeefb46b3471b', 'Grace in Action', 'Living out the gospel daily', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('5fd1be0565711b5c08aa4a9e', 'cb06a7106e9eeefb46b3471b', 'What is Grace?', 'Sermon 1 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-1.mp3', 1800,
     '1b8c4090c0f4b3824809f893', '58bcdfe3ddb34af5e4692414', 'published',
     '2026-05-01 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('c26d3979e880c5c7782064e0', 'cb06a7106e9eeefb46b3471b', 'The Call to Discipleship', 'Sermon 2 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-2.mp3', 1920,
     '34f58c950697d89fd853a919', '8ccc4587fda7c70c284fb2ae', 'published',
     '2026-04-02 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('f9f0e2ef4c637ef37af89f34', 'cb06a7106e9eeefb46b3471b', 'Walking in Faith', 'Sermon 3 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-3.mp3', 2040,
     'b84b4e0f29999922e771de6e', 'b3d175f75f23498844d4d972', 'published',
     '2026-03-03 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('24a05bbca9d172cf6033c2e1', 'cb06a7106e9eeefb46b3471b', 'Love Your Neighbor', 'Sermon 4 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-4.mp3', 2160,
     '425482f8e58de493ccc54316', '58bcdfe3ddb34af5e4692414', 'published',
     '2026-02-04 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('299936359961f5fd2057777f', 'cb06a7106e9eeefb46b3471b', 'Prayer that Moves Mountains', 'Sermon 5 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-5.mp3', 2280,
     'b684c0ae49bcecca26a3eb82', '8ccc4587fda7c70c284fb2ae', 'published',
     '2026-05-05 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('9f3bb2729bc17d17cd2cc3b0', 'cb06a7106e9eeefb46b3471b', 'The Power of Forgiveness', 'Sermon 6 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-6.mp3', 2400,
     '79200677a14aea850d03684a', 'b3d175f75f23498844d4d972', 'published',
     '2026-04-06 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('8400a822d1c4a967932cb820', 'cb06a7106e9eeefb46b3471b', 'Hope in Suffering', 'Sermon 7 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-7.mp3', 2520,
     '9feb413ed78a3d294a08253d', '58bcdfe3ddb34af5e4692414', 'published',
     '2026-03-07 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('d24eb38b08835baa35ed1db1', 'cb06a7106e9eeefb46b3471b', 'Living Generously', 'Sermon 8 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-8.mp3', 2640,
     '331224d9de0d0e0468434f1c', '8ccc4587fda7c70c284fb2ae', 'published',
     '2026-02-08 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('b2208889b17d7e13e5955caf', 'cb06a7106e9eeefb46b3471b', 'The Great Commission', 'Sermon 9 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-9.mp3', 2760,
     '6600e5123058f8716f182931', 'b3d175f75f23498844d4d972', 'published',
     '2026-05-09 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('aa8fa6db92103012727f4c31', 'cb06a7106e9eeefb46b3471b', 'Sabbath Rest', 'Sermon 10 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-10.mp3', 2880,
     'cddf8b1dfd7abef0363aab8c', '58bcdfe3ddb34af5e4692414', 'published',
     '2026-04-10 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('c802d511db1b420412721cf9', 'cb06a7106e9eeefb46b3471b', 'Faithful Stewardship', 'Sermon 11 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-11.mp3', 1800,
     'c37825a7aab3bf249e88ccb2', '8ccc4587fda7c70c284fb2ae', 'published',
     '2026-03-11 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('5a94394a0ad2567cf09d593a', 'cb06a7106e9eeefb46b3471b', 'Kingdom Priorities', 'Sermon 12 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-12.mp3', 1920,
     '1f614a022be735b859b4c57d', 'b3d175f75f23498844d4d972', 'published',
     '2026-02-12 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('f87ad3e3e5087c785303ecc5', 'cb06a7106e9eeefb46b3471b', 'The Heart of Worship', 'Sermon 13 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-13.mp3', 2040,
     '8e3826ca094e2a32af591ecd', '58bcdfe3ddb34af5e4692414', 'published',
     '2026-05-13 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('bc38ad203e79a733f7a04608', 'cb06a7106e9eeefb46b3471b', 'Standing Firm', 'Sermon 14 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-14.mp3', 2160,
     '0ffeae5d0568e67a46a55034', '8ccc4587fda7c70c284fb2ae', 'published',
     '2026-04-14 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "seriesId", "status", "date", "createdAt", "updatedAt") VALUES
    ('4895bc049fb6ec7f0106719f', 'cb06a7106e9eeefb46b3471b', 'Bearing Fruit', 'Sermon 15 in our archive.', 'sermon',
     'https://media.grace.community/sermons/sermon-15.mp3', 2280,
     '2cc63a0a17d5742a28c9b396', 'b3d175f75f23498844d4d972', 'published',
     '2026-03-15 10:00:00', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('cc4e9075051b931dc356a780', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Weekly Sunday worship service', 'service', 'Main Sanctuary', '2026-07-05 22:32:15', '2026-07-06 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('d145d3a8c1cdb6a1e9e57333', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Weekly Sunday worship service', 'service', 'Main Sanctuary', '2026-07-12 22:32:15', '2026-07-13 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('adeac83829a6068490827f0a', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Weekly Sunday worship service', 'service', 'Main Sanctuary', '2026-07-19 22:32:15', '2026-07-20 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('6aaf0c04c5a017f8fcb956e4', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Weekly Sunday worship service', 'service', 'Main Sanctuary', '2026-07-26 22:32:15', '2026-07-27 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('2179f08de770f0a05dffa74a', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Weekly Sunday worship service', 'service', 'Main Sanctuary', '2026-08-02 22:32:15', '2026-08-03 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('7ecde2957fff4780b418b350', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Weekly Sunday worship service', 'service', 'Main Sanctuary', '2026-08-09 22:32:15', '2026-08-10 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('73f18c1a34dc885c2d880e5c', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Weekly Sunday worship service', 'service', 'Main Sanctuary', '2026-08-16 22:32:15', '2026-08-17 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('c6f0c8ec225dda661948b999', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Weekly Sunday worship service', 'service', 'Main Sanctuary', '2026-08-23 22:32:15', '2026-08-24 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('255f15c3d5484f5ec3954444', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Sunday Service at Main Sanctuary', 'service', 'Main Sanctuary', '2026-08-31 22:32:15', '2026-09-01 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('5bd96d37288338f90663916f', 'cb06a7106e9eeefb46b3471b', 'Midweek Bible Study', 'Midweek Bible Study at Fellowship Hall', 'meeting', 'Fellowship Hall', '2026-09-02 22:32:15', '2026-09-03 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('e4ffbcfe92a16698db98c460', 'cb06a7106e9eeefb46b3471b', 'Youth Night', 'Youth Night at Youth Center', 'activity', 'Youth Center', '2026-09-04 22:32:15', '2026-09-05 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Event" ("id", "orgId", "title", "description", "category", "location", "startTime", "endTime", "createdAt", "updatedAt") VALUES
    ('dfa0619df8fc444379eb3531', 'cb06a7106e9eeefb46b3471b', 'Sunday Service', 'Sunday Service at Main Sanctuary', 'service', 'Main Sanctuary', '2026-09-07 22:32:15', '2026-09-08 00:02:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b18d9f4261083fbe3ab2a782', 'cc4e9075051b931dc356a780', '1b8c4090c0f4b3824809f893', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('735452b8665d7d9150ea5566', 'cc4e9075051b931dc356a780', 'b84b4e0f29999922e771de6e', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d3c4cd2e61ea4a3dbaec5f07', 'cc4e9075051b931dc356a780', '425482f8e58de493ccc54316', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('2c2b9e1ea140a0b49966238f', 'cc4e9075051b931dc356a780', '79200677a14aea850d03684a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('54889265faeee88101351f43', 'cc4e9075051b931dc356a780', '9feb413ed78a3d294a08253d', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('924e7d036f3e91db3e64cab4', 'cc4e9075051b931dc356a780', 'cddf8b1dfd7abef0363aab8c', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ace5546effd92849dee581c2', 'cc4e9075051b931dc356a780', 'c37825a7aab3bf249e88ccb2', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('28b31ad8e4990cbd1be28947', 'cc4e9075051b931dc356a780', '8e3826ca094e2a32af591ecd', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ef57b07bc073c04a34b0077c', 'cc4e9075051b931dc356a780', '0ffeae5d0568e67a46a55034', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('efc81a93025e4f3d778b9ad4', 'cc4e9075051b931dc356a780', '707a1d9defa92611df5f1252', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('01096bff8828b6d262a60fbc', 'cc4e9075051b931dc356a780', '1bc1e6ba6648a3c8908e82ce', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('44f85a2911046f036b13b66f', 'cc4e9075051b931dc356a780', 'b868ecf74d22c94e49b63cf8', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('412567a7d1913e8d08d9caea', 'cc4e9075051b931dc356a780', '88e494949d3f6b76814e6584', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('cd0e797db833664b0dfb5625', 'cc4e9075051b931dc356a780', 'd83310009709dc4a67b90f4c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8f40419d299fa509dfe5fb2c', 'cc4e9075051b931dc356a780', '356c002a1d0aa559d47be858', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e98f1dd8386e6b0f3a21efc2', 'cc4e9075051b931dc356a780', '537420bbd77eee69fae8bcbe', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('2b4fae158a208af059719ebc', 'cc4e9075051b931dc356a780', '2d3efba5715952f693b2cd7f', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('4c106877c631ff81f81bd7ec', 'cc4e9075051b931dc356a780', 'e61b9bb59b396b21dfabecd0', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('7463bf39c2811803c23b233a', 'cc4e9075051b931dc356a780', '3e165ae5bb833d0fa7adc35a', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3851e13f05869027ffa9c9e7', 'cc4e9075051b931dc356a780', '1ef9fc5bbcebb688b3ec65c1', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1ed525bfac5ccae2d589d252', 'cc4e9075051b931dc356a780', 'be968fb29501dc97030f2560', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1fdc0322f240f780afd59485', 'cc4e9075051b931dc356a780', 'c8a55065fd87e2d4d834095a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1d134c620d45c0afde39fdf6', 'cc4e9075051b931dc356a780', '44ce5c8d165507d3ad638810', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1fc7513c005c10fa11fc9633', 'cc4e9075051b931dc356a780', '368ed109035e1c8b663ed848', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('10c85ba518c54ac24af26718', 'cc4e9075051b931dc356a780', '2210f39f4d6d9cf1ab0fe621', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('52568b1b8ff8ac41c417004b', 'cc4e9075051b931dc356a780', 'bf92230c10d35f68e14aa333', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1882241ad9cbbd7a50746ede', 'cc4e9075051b931dc356a780', '1546aa2c6b7054534b83b061', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('4aa18bab113303ab41d3d718', 'cc4e9075051b931dc356a780', '86ec24d8b237bdedfd9e2f84', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a771bfbe45678cb0deda2ccf', 'cc4e9075051b931dc356a780', 'f5cfa9bbc686abd2d7cd8a61', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('09b8f187bcc3386b52a70bc5', 'cc4e9075051b931dc356a780', '55b8706aaa3bb373d84cdefb', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3e4f6b39c3396f8850f403f4', 'cc4e9075051b931dc356a780', '60ac494c696fc402db04908b', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('5c75dc0500d757977a94f080', 'cc4e9075051b931dc356a780', 'b8684299f4a18d693b155d48', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('00476568ebd3a62b5999b5e0', 'cc4e9075051b931dc356a780', '8766b3f03dbc34023af5871c', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e95d4661070de0674a43b0e1', 'cc4e9075051b931dc356a780', 'dfeea7301df359e7ca736914', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f97cfc2195592135b1004e74', 'cc4e9075051b931dc356a780', '5e5b3aeb3f2fa1de1b527678', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('af5d3738a1a82906424d43f8', 'cc4e9075051b931dc356a780', 'e10e170c73d9b574d5fe3e97', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('616c95f21859a7980fd04807', 'd145d3a8c1cdb6a1e9e57333', '1b8c4090c0f4b3824809f893', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('879edcb8cf18ad2134826335', 'd145d3a8c1cdb6a1e9e57333', '34f58c950697d89fd853a919', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('934f85ef40916e2d689453e7', 'd145d3a8c1cdb6a1e9e57333', '425482f8e58de493ccc54316', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('19c39e6acaeb1de4bfb03616', 'd145d3a8c1cdb6a1e9e57333', 'b684c0ae49bcecca26a3eb82', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('cadc0a60732e72f4366670c2', 'd145d3a8c1cdb6a1e9e57333', '9feb413ed78a3d294a08253d', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('29fce4e5be0649775d40cd9e', 'd145d3a8c1cdb6a1e9e57333', '331224d9de0d0e0468434f1c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('0e4ce47f29f57da5b2cfedd4', 'd145d3a8c1cdb6a1e9e57333', 'c37825a7aab3bf249e88ccb2', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('08b0956a34624b2929a874a6', 'd145d3a8c1cdb6a1e9e57333', '1f614a022be735b859b4c57d', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a5ea698ce0cdd443780b51b5', 'd145d3a8c1cdb6a1e9e57333', '0ffeae5d0568e67a46a55034', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('edb75a39ac530645b4374f6a', 'd145d3a8c1cdb6a1e9e57333', '2cc63a0a17d5742a28c9b396', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3fde884e66330e66c65bc6f3', 'd145d3a8c1cdb6a1e9e57333', '1bc1e6ba6648a3c8908e82ce', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('279dee9f2e8cff09a531a6d7', 'd145d3a8c1cdb6a1e9e57333', '3e4fc0445408e5a9cae678ff', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('bb68824d143549dff1e92105', 'd145d3a8c1cdb6a1e9e57333', '88e494949d3f6b76814e6584', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c75057594e77a9b3e36dae91', 'd145d3a8c1cdb6a1e9e57333', '7905a427d5d4b7b4f321d8b4', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ce21b191dc02f70e03f1f73e', 'd145d3a8c1cdb6a1e9e57333', '356c002a1d0aa559d47be858', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('cafc0f7a1763596a3df3030c', 'd145d3a8c1cdb6a1e9e57333', '479ab3755e9b310cc0f966c7', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ae0b354c7d467db55fa6c617', 'd145d3a8c1cdb6a1e9e57333', '2d3efba5715952f693b2cd7f', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('230a6aceb5e56f432f0c18e7', 'd145d3a8c1cdb6a1e9e57333', '0cdf560aca5ba12e3b3a210d', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('4f18e9555ed046f7e67260a7', 'd145d3a8c1cdb6a1e9e57333', '3e165ae5bb833d0fa7adc35a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('54c4a06cdc8fdf25221971f5', 'd145d3a8c1cdb6a1e9e57333', '49b6767ba8601008a8a2b841', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('9f446d6b37286920dd0d1400', 'd145d3a8c1cdb6a1e9e57333', 'be968fb29501dc97030f2560', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('4dcecf6045a59e1e9c41e0a6', 'd145d3a8c1cdb6a1e9e57333', '1d462a200597204b7d6cb3bd', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1bdf806d07ff1204c78ef25e', 'd145d3a8c1cdb6a1e9e57333', '44ce5c8d165507d3ad638810', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e17d65dbb54e28f3b3baa9bc', 'd145d3a8c1cdb6a1e9e57333', '411a04c70732e14ea859dd10', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b619933f18f6ec225f7823d8', 'd145d3a8c1cdb6a1e9e57333', '2210f39f4d6d9cf1ab0fe621', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('cb7f072cb43be6cf33b82536', 'd145d3a8c1cdb6a1e9e57333', 'c7cfc176857be5bc0c2bf6b9', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a5b0e47328c973814006ff09', 'd145d3a8c1cdb6a1e9e57333', '1546aa2c6b7054534b83b061', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f75e1eef5b65f389ca1764dc', 'd145d3a8c1cdb6a1e9e57333', 'd2e54e9b47f8c2fbd16576ae', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f8d29182a07109c0cdb56b38', 'd145d3a8c1cdb6a1e9e57333', 'f5cfa9bbc686abd2d7cd8a61', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b9e087995ae7d04d8a65b5d4', 'd145d3a8c1cdb6a1e9e57333', 'e10d6177321243fc1ca26f79', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1703ece7fb11599f9937f6d2', 'd145d3a8c1cdb6a1e9e57333', '60ac494c696fc402db04908b', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('945c012ddb0d5fa8c3745abd', 'd145d3a8c1cdb6a1e9e57333', '12252401b571865fbc3e5aff', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('89a1ad057c9b595d34ca043b', 'd145d3a8c1cdb6a1e9e57333', '8766b3f03dbc34023af5871c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a067d90081019069a79b28ce', 'd145d3a8c1cdb6a1e9e57333', 'df18a38e6f5561a16bd1e96a', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('53efb19784b440aea59d52c6', 'd145d3a8c1cdb6a1e9e57333', '5e5b3aeb3f2fa1de1b527678', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('045879eb2cebbc9646ead204', 'd145d3a8c1cdb6a1e9e57333', 'ad9652d6681f945d2a919c46', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('948d4df46813744faeded6b3', 'adeac83829a6068490827f0a', '34f58c950697d89fd853a919', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('7e8f1882df8a8d986f17fdf3', 'adeac83829a6068490827f0a', 'b84b4e0f29999922e771de6e', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('77099758b21a0b410384c6e6', 'adeac83829a6068490827f0a', 'b684c0ae49bcecca26a3eb82', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f3e57f88a7cc1214a4760c08', 'adeac83829a6068490827f0a', '79200677a14aea850d03684a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('035c053284499234c627579c', 'adeac83829a6068490827f0a', '331224d9de0d0e0468434f1c', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c7fbc4f35e91924cc809176f', 'adeac83829a6068490827f0a', '6600e5123058f8716f182931', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('6bad1242263807c419199f23', 'adeac83829a6068490827f0a', '1f614a022be735b859b4c57d', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('93ddf44e0016d8bcefa2b8dd', 'adeac83829a6068490827f0a', '8e3826ca094e2a32af591ecd', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('35355687bad27b1b426076c0', 'adeac83829a6068490827f0a', '2cc63a0a17d5742a28c9b396', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('caeec76c85e13f0b45175e25', 'adeac83829a6068490827f0a', '707a1d9defa92611df5f1252', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('33b5c6eddddf97c2092615b0', 'adeac83829a6068490827f0a', '3e4fc0445408e5a9cae678ff', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('5fb50e0be2f7ac2088946d3c', 'adeac83829a6068490827f0a', '5ac5e847a26a4c26890449b1', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8f680a6158ae952d9289d232', 'adeac83829a6068490827f0a', '7905a427d5d4b7b4f321d8b4', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('9e38d19c3315584c994bd5f6', 'adeac83829a6068490827f0a', 'd83310009709dc4a67b90f4c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('06e8753217824be0dc984683', 'adeac83829a6068490827f0a', '479ab3755e9b310cc0f966c7', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a8030bb7fb79d041ec2bedc1', 'adeac83829a6068490827f0a', '537420bbd77eee69fae8bcbe', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a66eca30e7cdc50b3a225132', 'adeac83829a6068490827f0a', '0cdf560aca5ba12e3b3a210d', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('64b78093a431ecf9d34d5ef8', 'adeac83829a6068490827f0a', 'c92b45917fd2cf7aedea1745', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('13919ac5dcb8e0d366c98ca9', 'adeac83829a6068490827f0a', '49b6767ba8601008a8a2b841', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('5aa940fd8874f49bcc267ac6', 'adeac83829a6068490827f0a', '1ef9fc5bbcebb688b3ec65c1', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('01a83b0525e2c1db11921fff', 'adeac83829a6068490827f0a', '1d462a200597204b7d6cb3bd', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d1c4dae106771fad1e0018e5', 'adeac83829a6068490827f0a', 'c8a55065fd87e2d4d834095a', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('9077586c0260cc533a8f0578', 'adeac83829a6068490827f0a', '411a04c70732e14ea859dd10', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('aa608b5b5e3048b5cf556656', 'adeac83829a6068490827f0a', 'f081ae454f2d4c73fe1114a4', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d22c3af1c908210183f8b5cf', 'adeac83829a6068490827f0a', 'c7cfc176857be5bc0c2bf6b9', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('df58615b0c898bd9a7075965', 'adeac83829a6068490827f0a', 'bf92230c10d35f68e14aa333', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d36e1f6de3f6bcf14660c10c', 'adeac83829a6068490827f0a', 'd2e54e9b47f8c2fbd16576ae', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ea75a904423e090681e0f111', 'adeac83829a6068490827f0a', '86ec24d8b237bdedfd9e2f84', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('64b1065af08c79b6a9774be8', 'adeac83829a6068490827f0a', 'e10d6177321243fc1ca26f79', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d9767dde095f85e4729f3c25', 'adeac83829a6068490827f0a', 'c4021a71bd61e6bb43412fd2', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('4ac3a25c1dc3f9c9e35a713c', 'adeac83829a6068490827f0a', '12252401b571865fbc3e5aff', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b73b452ae86a40b102387b85', 'adeac83829a6068490827f0a', 'b8684299f4a18d693b155d48', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a5332c1c118cc1fad1508cf2', 'adeac83829a6068490827f0a', 'df18a38e6f5561a16bd1e96a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ff773051f9bd82e704d547fa', 'adeac83829a6068490827f0a', 'dfeea7301df359e7ca736914', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ecdc285b7a6346e59902f921', 'adeac83829a6068490827f0a', 'ad9652d6681f945d2a919c46', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('7355f3d26580dd74f48c83a7', 'adeac83829a6068490827f0a', '9e276b2295591013876f82be', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a1591dd484292ccd9be523c2', '6aaf0c04c5a017f8fcb956e4', 'b84b4e0f29999922e771de6e', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3d1a8fed0e077783abf6866d', '6aaf0c04c5a017f8fcb956e4', '425482f8e58de493ccc54316', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('be186d251216ccaee7c89340', '6aaf0c04c5a017f8fcb956e4', '79200677a14aea850d03684a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c369932518f776c75dfc2919', '6aaf0c04c5a017f8fcb956e4', '9feb413ed78a3d294a08253d', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('7454d437622d3f1e111493e2', '6aaf0c04c5a017f8fcb956e4', '6600e5123058f8716f182931', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('402837dae13cf186cd1318aa', '6aaf0c04c5a017f8fcb956e4', 'cddf8b1dfd7abef0363aab8c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('25ed03ab76c36ba435ac8209', '6aaf0c04c5a017f8fcb956e4', '8e3826ca094e2a32af591ecd', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e709e7da0e3387eaf899372c', '6aaf0c04c5a017f8fcb956e4', '0ffeae5d0568e67a46a55034', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b7cf715e00e1061bda92f0bd', '6aaf0c04c5a017f8fcb956e4', '707a1d9defa92611df5f1252', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c68e220e18eed41b8bc547ca', '6aaf0c04c5a017f8fcb956e4', '1bc1e6ba6648a3c8908e82ce', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('faab63b6b3b047f5464860f8', '6aaf0c04c5a017f8fcb956e4', '5ac5e847a26a4c26890449b1', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8aaafb2059dc6d6fd4d1adb4', '6aaf0c04c5a017f8fcb956e4', 'b868ecf74d22c94e49b63cf8', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f1937eafa129e5ceb913cd03', '6aaf0c04c5a017f8fcb956e4', 'd83310009709dc4a67b90f4c', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('6d4e7027d54b55fe79236467', '6aaf0c04c5a017f8fcb956e4', '356c002a1d0aa559d47be858', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('39c356a53ba36ef6380391d7', '6aaf0c04c5a017f8fcb956e4', '537420bbd77eee69fae8bcbe', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('fb6666cf848ed66bde6dc13e', '6aaf0c04c5a017f8fcb956e4', '2d3efba5715952f693b2cd7f', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('73a82b11b57912a40f546ea2', '6aaf0c04c5a017f8fcb956e4', 'c92b45917fd2cf7aedea1745', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('de481813feb36e1b797e27ca', '6aaf0c04c5a017f8fcb956e4', 'e61b9bb59b396b21dfabecd0', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('2b4d1dbf3766513d67ad1bd0', '6aaf0c04c5a017f8fcb956e4', '1ef9fc5bbcebb688b3ec65c1', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d171a556a65040bafcac7208', '6aaf0c04c5a017f8fcb956e4', 'be968fb29501dc97030f2560', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('70179619eb1c6d6bb73647c2', '6aaf0c04c5a017f8fcb956e4', 'c8a55065fd87e2d4d834095a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e26896bbddab0e56959db3e6', '6aaf0c04c5a017f8fcb956e4', '44ce5c8d165507d3ad638810', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d5cb3bb11e13293c7cf432cd', '6aaf0c04c5a017f8fcb956e4', 'f081ae454f2d4c73fe1114a4', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d3293dbe38d51ded2e4de7a1', '6aaf0c04c5a017f8fcb956e4', '368ed109035e1c8b663ed848', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c1e8fdcd654767b96da1216c', '6aaf0c04c5a017f8fcb956e4', 'bf92230c10d35f68e14aa333', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('2f50154c865e0bbffd670f1d', '6aaf0c04c5a017f8fcb956e4', '1546aa2c6b7054534b83b061', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('aa0a853431878b376307ffe5', '6aaf0c04c5a017f8fcb956e4', '86ec24d8b237bdedfd9e2f84', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('7581b78d8571d07377a2ea0c', '6aaf0c04c5a017f8fcb956e4', 'f5cfa9bbc686abd2d7cd8a61', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('0ff9b6da0a24f645fb72fd81', '6aaf0c04c5a017f8fcb956e4', 'c4021a71bd61e6bb43412fd2', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d534fa714513bac85d4c3f09', '6aaf0c04c5a017f8fcb956e4', '55b8706aaa3bb373d84cdefb', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('443dcbf5097d31b613398ac9', '6aaf0c04c5a017f8fcb956e4', 'b8684299f4a18d693b155d48', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d8f1897566200ac40fcce367', '6aaf0c04c5a017f8fcb956e4', '8766b3f03dbc34023af5871c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a2a6e5edc281747d2e362b05', '6aaf0c04c5a017f8fcb956e4', 'dfeea7301df359e7ca736914', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8c9fc2b5b65e6afc0bbf1a6e', '6aaf0c04c5a017f8fcb956e4', '5e5b3aeb3f2fa1de1b527678', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('fc6b0dec13665139a3f1f458', '6aaf0c04c5a017f8fcb956e4', '9e276b2295591013876f82be', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('87eea4cf31fa1e3fca0e0c1d', '6aaf0c04c5a017f8fcb956e4', 'e10e170c73d9b574d5fe3e97', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('54d938bf6568ff2ca0152b94', '2179f08de770f0a05dffa74a', '1b8c4090c0f4b3824809f893', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c1c340042dd49901a612dcfd', '2179f08de770f0a05dffa74a', '425482f8e58de493ccc54316', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('0b87418326113d9f4cdda1c1', '2179f08de770f0a05dffa74a', 'b684c0ae49bcecca26a3eb82', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8f706496c6224ab290e22a1b', '2179f08de770f0a05dffa74a', '9feb413ed78a3d294a08253d', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('361197ce0a35c7f1b9833a49', '2179f08de770f0a05dffa74a', '331224d9de0d0e0468434f1c', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('825e2551e4c4fdcd5a81fd60', '2179f08de770f0a05dffa74a', 'cddf8b1dfd7abef0363aab8c', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('06c5a54be70ffa80f8a9f3d5', '2179f08de770f0a05dffa74a', 'c37825a7aab3bf249e88ccb2', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('eee30911b479c45e971e7eaa', '2179f08de770f0a05dffa74a', '0ffeae5d0568e67a46a55034', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c4c6990be6f3683b5c41f30a', '2179f08de770f0a05dffa74a', '2cc63a0a17d5742a28c9b396', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('47545524442a607e0bd0ec47', '2179f08de770f0a05dffa74a', '1bc1e6ba6648a3c8908e82ce', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('55829a4b7307bb6a7fbf8aa6', '2179f08de770f0a05dffa74a', '3e4fc0445408e5a9cae678ff', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('bd89d53c31e51c97665ca74f', '2179f08de770f0a05dffa74a', 'b868ecf74d22c94e49b63cf8', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('448a3f0d0366e8bf18dc4b14', '2179f08de770f0a05dffa74a', '88e494949d3f6b76814e6584', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('7819364b0e26236f46c2be1b', '2179f08de770f0a05dffa74a', '356c002a1d0aa559d47be858', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('896f6eedd0daa7d35d4ebbc9', '2179f08de770f0a05dffa74a', '479ab3755e9b310cc0f966c7', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('51f070611057b0919e77c922', '2179f08de770f0a05dffa74a', '2d3efba5715952f693b2cd7f', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('15388b1a32f2ceb0897431c6', '2179f08de770f0a05dffa74a', '0cdf560aca5ba12e3b3a210d', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('48e161a88cdc7cabb8113361', '2179f08de770f0a05dffa74a', 'e61b9bb59b396b21dfabecd0', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('4b0f3c0a957d6002a7a68637', '2179f08de770f0a05dffa74a', '3e165ae5bb833d0fa7adc35a', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e669650a24a658a7da44b98d', '2179f08de770f0a05dffa74a', 'be968fb29501dc97030f2560', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3df07909c7e4cfa94f799abd', '2179f08de770f0a05dffa74a', '1d462a200597204b7d6cb3bd', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('194e8957028fca56747fb190', '2179f08de770f0a05dffa74a', '44ce5c8d165507d3ad638810', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('0181d98216b5b04af03d6440', '2179f08de770f0a05dffa74a', '411a04c70732e14ea859dd10', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('9450943489480f1480088abc', '2179f08de770f0a05dffa74a', '368ed109035e1c8b663ed848', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3f5266c94491aae273fc8fdc', '2179f08de770f0a05dffa74a', '2210f39f4d6d9cf1ab0fe621', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('50b6d4cdc9fea7dee16c38b5', '2179f08de770f0a05dffa74a', '1546aa2c6b7054534b83b061', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('358ea544c2ab002d187fa265', '2179f08de770f0a05dffa74a', 'd2e54e9b47f8c2fbd16576ae', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('64181df123c046608acfea23', '2179f08de770f0a05dffa74a', 'f5cfa9bbc686abd2d7cd8a61', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('95711e8755da8523567ae082', '2179f08de770f0a05dffa74a', 'e10d6177321243fc1ca26f79', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e3869567f6b343a2fffbae0f', '2179f08de770f0a05dffa74a', '55b8706aaa3bb373d84cdefb', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1e0770d2ffb6812f3bb079ad', '2179f08de770f0a05dffa74a', '60ac494c696fc402db04908b', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('5a2435620f7d738e58f135d2', '2179f08de770f0a05dffa74a', '8766b3f03dbc34023af5871c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('978f59c63762cda0c5f674ec', '2179f08de770f0a05dffa74a', 'df18a38e6f5561a16bd1e96a', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1af80d5b5ce2ee0f6bd8d951', '2179f08de770f0a05dffa74a', '5e5b3aeb3f2fa1de1b527678', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('dd65a017837cc1ba9fc12ac4', '2179f08de770f0a05dffa74a', 'ad9652d6681f945d2a919c46', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('01d9fb4215cb02dd3690b4fc', '2179f08de770f0a05dffa74a', 'e10e170c73d9b574d5fe3e97', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('07e5f24f90993ae8ca25b11e', '7ecde2957fff4780b418b350', '1b8c4090c0f4b3824809f893', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d88e426399150d2f8550a179', '7ecde2957fff4780b418b350', '34f58c950697d89fd853a919', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f7f559183e83267062270a06', '7ecde2957fff4780b418b350', 'b684c0ae49bcecca26a3eb82', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('5294daba8ab6015060b0d0be', '7ecde2957fff4780b418b350', '79200677a14aea850d03684a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('62dcbf3146c68438b5b0aa65', '7ecde2957fff4780b418b350', '331224d9de0d0e0468434f1c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('fd0924ed5825bd32c0f3532d', '7ecde2957fff4780b418b350', '6600e5123058f8716f182931', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('83f722679b368e2f7010a9c1', '7ecde2957fff4780b418b350', 'c37825a7aab3bf249e88ccb2', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d1bd9052cf35eb97ca11ccbb', '7ecde2957fff4780b418b350', '1f614a022be735b859b4c57d', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ce77c744091ba89b9042c63d', '7ecde2957fff4780b418b350', '2cc63a0a17d5742a28c9b396', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8fd0d9e79c648898490784fc', '7ecde2957fff4780b418b350', '707a1d9defa92611df5f1252', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('65f44c6c6ad1177278d5a19f', '7ecde2957fff4780b418b350', '3e4fc0445408e5a9cae678ff', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('6821058f0af2ed0e09b3e7f5', '7ecde2957fff4780b418b350', '5ac5e847a26a4c26890449b1', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1f2d079b573dbea422ca7dc5', '7ecde2957fff4780b418b350', '88e494949d3f6b76814e6584', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('0be48274a1daf9fba8795ca2', '7ecde2957fff4780b418b350', '7905a427d5d4b7b4f321d8b4', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('28e6e9f855f3fe127dfb37fe', '7ecde2957fff4780b418b350', '479ab3755e9b310cc0f966c7', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e37e5e138ae8511f5cc8a3db', '7ecde2957fff4780b418b350', '537420bbd77eee69fae8bcbe', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a314ce21247b2ad1b1a2766f', '7ecde2957fff4780b418b350', '0cdf560aca5ba12e3b3a210d', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c262331294798ab47804bb21', '7ecde2957fff4780b418b350', 'c92b45917fd2cf7aedea1745', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('727afbb2fc21df98ff393787', '7ecde2957fff4780b418b350', '3e165ae5bb833d0fa7adc35a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('7ffb746c02e720511c6b6d1e', '7ecde2957fff4780b418b350', '49b6767ba8601008a8a2b841', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d65fbf3b3b4782e973778659', '7ecde2957fff4780b418b350', '1d462a200597204b7d6cb3bd', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1181ae6414ed467e41e64fbe', '7ecde2957fff4780b418b350', 'c8a55065fd87e2d4d834095a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('319098b7ae597429dedb41a2', '7ecde2957fff4780b418b350', '411a04c70732e14ea859dd10', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d9dba5f0a46b30f18da96541', '7ecde2957fff4780b418b350', 'f081ae454f2d4c73fe1114a4', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('453403fab3d868ddf6b708d8', '7ecde2957fff4780b418b350', '2210f39f4d6d9cf1ab0fe621', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('cc8a50b52f044c14938a06ff', '7ecde2957fff4780b418b350', 'c7cfc176857be5bc0c2bf6b9', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f88be7a61b6562710306b6b6', '7ecde2957fff4780b418b350', 'd2e54e9b47f8c2fbd16576ae', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('6ad47abce096f774bc859d22', '7ecde2957fff4780b418b350', '86ec24d8b237bdedfd9e2f84', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b7ca7d8415f995718176bc94', '7ecde2957fff4780b418b350', 'e10d6177321243fc1ca26f79', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c34809d4733280319c13bbee', '7ecde2957fff4780b418b350', 'c4021a71bd61e6bb43412fd2', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('04d51f70d830132aa8b1fdc2', '7ecde2957fff4780b418b350', '60ac494c696fc402db04908b', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f1fdaa9160a476c5989882aa', '7ecde2957fff4780b418b350', '12252401b571865fbc3e5aff', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8eb58dd9c8ecdea895cb66da', '7ecde2957fff4780b418b350', 'df18a38e6f5561a16bd1e96a', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('0fe4aae1a8afa162bc365e9f', '7ecde2957fff4780b418b350', 'dfeea7301df359e7ca736914', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('5c3a49b1c297f6dcbe07d25c', '7ecde2957fff4780b418b350', 'ad9652d6681f945d2a919c46', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('018611052b85edf8e99e4386', '7ecde2957fff4780b418b350', '9e276b2295591013876f82be', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('e3859fa70bcf35502f98d633', '73f18c1a34dc885c2d880e5c', '34f58c950697d89fd853a919', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('9fbc20d4e764453dd36d89c1', '73f18c1a34dc885c2d880e5c', 'b84b4e0f29999922e771de6e', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('df6fdb37209593ada3ab668e', '73f18c1a34dc885c2d880e5c', '79200677a14aea850d03684a', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('50ad0d9811ce6b213e60f557', '73f18c1a34dc885c2d880e5c', '9feb413ed78a3d294a08253d', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a3f106d3d9f2b558a4013edc', '73f18c1a34dc885c2d880e5c', '6600e5123058f8716f182931', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('76a706d60cb071745108bca9', '73f18c1a34dc885c2d880e5c', 'cddf8b1dfd7abef0363aab8c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('05732d7ae7bfe66ecc938561', '73f18c1a34dc885c2d880e5c', '1f614a022be735b859b4c57d', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('2cf45269ee9f23abd1b339d1', '73f18c1a34dc885c2d880e5c', '8e3826ca094e2a32af591ecd', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('38a978d469e7607b72baae98', '73f18c1a34dc885c2d880e5c', '707a1d9defa92611df5f1252', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b5b55d2aa9a28c597f370df0', '73f18c1a34dc885c2d880e5c', '1bc1e6ba6648a3c8908e82ce', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3ff691d9d51d2f9db373a28a', '73f18c1a34dc885c2d880e5c', '5ac5e847a26a4c26890449b1', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('84a3d9427ff98e7616ba8fe7', '73f18c1a34dc885c2d880e5c', 'b868ecf74d22c94e49b63cf8', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('4d0eb42070f38b1806a1a970', '73f18c1a34dc885c2d880e5c', '7905a427d5d4b7b4f321d8b4', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('971e3210b2cd9dd747368387', '73f18c1a34dc885c2d880e5c', 'd83310009709dc4a67b90f4c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b425adb0a956a79a7d617ed2', '73f18c1a34dc885c2d880e5c', '537420bbd77eee69fae8bcbe', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('0bac5b677440ada4b5adbc19', '73f18c1a34dc885c2d880e5c', '2d3efba5715952f693b2cd7f', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a0069ce1aad8a270a899c060', '73f18c1a34dc885c2d880e5c', 'c92b45917fd2cf7aedea1745', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c650c0407ba08512e3f09ba8', '73f18c1a34dc885c2d880e5c', 'e61b9bb59b396b21dfabecd0', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a649ebdbdc4df9135bec6188', '73f18c1a34dc885c2d880e5c', '49b6767ba8601008a8a2b841', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a919cdf3527b93f40b790b36', '73f18c1a34dc885c2d880e5c', '1ef9fc5bbcebb688b3ec65c1', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('bcdf90d371bdf39d8357d68b', '73f18c1a34dc885c2d880e5c', 'c8a55065fd87e2d4d834095a', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('33fe6290ecc312fa520bdffa', '73f18c1a34dc885c2d880e5c', '44ce5c8d165507d3ad638810', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('251a1400907b85857c5e48ff', '73f18c1a34dc885c2d880e5c', 'f081ae454f2d4c73fe1114a4', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('0d025064a7c4600153b1deb8', '73f18c1a34dc885c2d880e5c', '368ed109035e1c8b663ed848', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('75041481a0a9f7f618a7de9d', '73f18c1a34dc885c2d880e5c', 'c7cfc176857be5bc0c2bf6b9', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('44182f5ffbe6b8eba3cf581d', '73f18c1a34dc885c2d880e5c', 'bf92230c10d35f68e14aa333', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('36a2cf11952b66962f2cdf2b', '73f18c1a34dc885c2d880e5c', '86ec24d8b237bdedfd9e2f84', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('569529363e28c8a5ffbd88f6', '73f18c1a34dc885c2d880e5c', 'f5cfa9bbc686abd2d7cd8a61', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('830ada2efbda776f47032323', '73f18c1a34dc885c2d880e5c', 'c4021a71bd61e6bb43412fd2', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('cea00e2002bde29469546e83', '73f18c1a34dc885c2d880e5c', '55b8706aaa3bb373d84cdefb', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('6262d1f16747471f7038e361', '73f18c1a34dc885c2d880e5c', '12252401b571865fbc3e5aff', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('82275250288ac3efb0cf89cf', '73f18c1a34dc885c2d880e5c', 'b8684299f4a18d693b155d48', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('393696aaaec7e75b08779cb7', '73f18c1a34dc885c2d880e5c', 'dfeea7301df359e7ca736914', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('785a8cb35b6487d650a4b233', '73f18c1a34dc885c2d880e5c', '5e5b3aeb3f2fa1de1b527678', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8a88053e9cbc8ae7cd377ff4', '73f18c1a34dc885c2d880e5c', '9e276b2295591013876f82be', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('daa14deef1c3835db47a47b2', '73f18c1a34dc885c2d880e5c', 'e10e170c73d9b574d5fe3e97', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('f1bf8d7d8850b87d9dcff80f', 'c6f0c8ec225dda661948b999', '1b8c4090c0f4b3824809f893', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d910f91961e6d536711d36f4', 'c6f0c8ec225dda661948b999', 'b84b4e0f29999922e771de6e', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('024b411327bfd19eba6fc20b', 'c6f0c8ec225dda661948b999', '425482f8e58de493ccc54316', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('12f62ac5871e8f78900737a4', 'c6f0c8ec225dda661948b999', '9feb413ed78a3d294a08253d', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('975c310d914e5fb1d2ae7125', 'c6f0c8ec225dda661948b999', '331224d9de0d0e0468434f1c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('2726f57fc6dea6bcf1088a96', 'c6f0c8ec225dda661948b999', 'cddf8b1dfd7abef0363aab8c', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('da2c0e4b3d7bae0ed3fdd091', 'c6f0c8ec225dda661948b999', 'c37825a7aab3bf249e88ccb2', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a8f877cfc7fd6e3e966e9545', 'c6f0c8ec225dda661948b999', '8e3826ca094e2a32af591ecd', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('4c91073b24309cdd469b3947', 'c6f0c8ec225dda661948b999', '0ffeae5d0568e67a46a55034', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b85b76f363e06cad4c2c9a65', 'c6f0c8ec225dda661948b999', '1bc1e6ba6648a3c8908e82ce', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('376e8c1b854bba0ec191b03e', 'c6f0c8ec225dda661948b999', '3e4fc0445408e5a9cae678ff', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('770bf20bb0fce16eca3fe974', 'c6f0c8ec225dda661948b999', 'b868ecf74d22c94e49b63cf8', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('1019f2ab19137b8bb8875837', 'c6f0c8ec225dda661948b999', '88e494949d3f6b76814e6584', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3971c4173dcb4cd4b6c51ae1', 'c6f0c8ec225dda661948b999', 'd83310009709dc4a67b90f4c', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3834b4541369a22400c32d26', 'c6f0c8ec225dda661948b999', '356c002a1d0aa559d47be858', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('aa4b26227001466dc9d7bda7', 'c6f0c8ec225dda661948b999', '2d3efba5715952f693b2cd7f', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('cb9a4c9e89d8bbca8094680c', 'c6f0c8ec225dda661948b999', '0cdf560aca5ba12e3b3a210d', 'absent', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('bbb5716ed6681a9054d379ea', 'c6f0c8ec225dda661948b999', 'e61b9bb59b396b21dfabecd0', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('04830fd55795f30f252f6e6a', 'c6f0c8ec225dda661948b999', '3e165ae5bb833d0fa7adc35a', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('a15c95a724ef5662afa360e5', 'c6f0c8ec225dda661948b999', '1ef9fc5bbcebb688b3ec65c1', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('ebd6f921e02407034f761a14', 'c6f0c8ec225dda661948b999', 'be968fb29501dc97030f2560', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('d8941a3b2fcbc9086bc6d1c0', 'c6f0c8ec225dda661948b999', '44ce5c8d165507d3ad638810', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('21719ec04675552727061276', 'c6f0c8ec225dda661948b999', '411a04c70732e14ea859dd10', 'late', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('28fbf5b8a5e6b03bb2924389', 'c6f0c8ec225dda661948b999', '368ed109035e1c8b663ed848', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('c8f9bacfbfed679045307ffe', 'c6f0c8ec225dda661948b999', '2210f39f4d6d9cf1ab0fe621', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('76e199051ffa10c473df5ed7', 'c6f0c8ec225dda661948b999', 'bf92230c10d35f68e14aa333', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('bdd45e4524de6a5dd562e892', 'c6f0c8ec225dda661948b999', '1546aa2c6b7054534b83b061', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('8be90e50a43370c5c3642653', 'c6f0c8ec225dda661948b999', 'f5cfa9bbc686abd2d7cd8a61', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('560bd28c52a5370b3cfdf3a8', 'c6f0c8ec225dda661948b999', 'e10d6177321243fc1ca26f79', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('813b22e1b349a7f294624ed5', 'c6f0c8ec225dda661948b999', '55b8706aaa3bb373d84cdefb', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('11eb865b6cefd53efcfeac38', 'c6f0c8ec225dda661948b999', '60ac494c696fc402db04908b', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('7c6612b43a70383d188be02f', 'c6f0c8ec225dda661948b999', 'b8684299f4a18d693b155d48', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('3767ec9c2f88108c5a36da46', 'c6f0c8ec225dda661948b999', '8766b3f03dbc34023af5871c', 'excused', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('b915cbbd8b2709c3e2a86526', 'c6f0c8ec225dda661948b999', '5e5b3aeb3f2fa1de1b527678', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('14d33d212f453155c96a8f66', 'c6f0c8ec225dda661948b999', 'ad9652d6681f945d2a919c46', 'present', '2026-08-30 22:32:15');
INSERT INTO "Attendance" ("id", "eventId", "memberId", "status", "recordedAt") VALUES
        ('243e1b22a5d0c365a94e1210', 'c6f0c8ec225dda661948b999', 'e10e170c73d9b574d5fe3e97', 'present', '2026-08-30 22:32:15');
INSERT INTO "Tag" ("id", "orgId", "name", "type", "color", "createdAt") VALUES
    ('498aeccd42448a02517cef20', 'cb06a7106e9eeefb46b3471b', 'Elder', 'member', '#181818', '2026-08-30 22:32:15');
INSERT INTO "Tag" ("id", "orgId", "name", "type", "color", "createdAt") VALUES
    ('5f5cdfeb83507e19503e7b7a', 'cb06a7106e9eeefb46b3471b', 'New Member', 'member', '#2e7d6b', '2026-08-30 22:32:15');
INSERT INTO "Tag" ("id", "orgId", "name", "type", "color", "createdAt") VALUES
    ('775d504713fa003ffe82a70e', 'cb06a7106e9eeefb46b3471b', 'Baptized', 'member', '#2563eb', '2026-08-30 22:32:15');
INSERT INTO "Tag" ("id", "orgId", "name", "type", "color", "createdAt") VALUES
    ('497b8c8de21421f7727d0c7e', 'cb06a7106e9eeefb46b3471b', 'Featured', 'media', '#d4a017', '2026-08-30 22:32:15');
INSERT INTO "Tag" ("id", "orgId", "name", "type", "color", "createdAt") VALUES
    ('cf47e274f907fb97d12e9c79', 'cb06a7106e9eeefb46b3471b', 'Holiday', 'event', '#c0311f', '2026-08-30 22:32:15');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('1b8c4090c0f4b3824809f893', '498aeccd42448a02517cef20');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('1b8c4090c0f4b3824809f893', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('1b8c4090c0f4b3824809f893', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('425482f8e58de493ccc54316', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('79200677a14aea850d03684a', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('9feb413ed78a3d294a08253d', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('6600e5123058f8716f182931', '498aeccd42448a02517cef20');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('cddf8b1dfd7abef0363aab8c', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('c37825a7aab3bf249e88ccb2', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('8e3826ca094e2a32af591ecd', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('707a1d9defa92611df5f1252', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('707a1d9defa92611df5f1252', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('1bc1e6ba6648a3c8908e82ce', '498aeccd42448a02517cef20');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('5ac5e847a26a4c26890449b1', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('88e494949d3f6b76814e6584', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('7905a427d5d4b7b4f321d8b4', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('479ab3755e9b310cc0f966c7', '498aeccd42448a02517cef20');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('479ab3755e9b310cc0f966c7', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('537420bbd77eee69fae8bcbe', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('0cdf560aca5ba12e3b3a210d', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('3e165ae5bb833d0fa7adc35a', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('3e165ae5bb833d0fa7adc35a', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('1ef9fc5bbcebb688b3ec65c1', '498aeccd42448a02517cef20');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('be968fb29501dc97030f2560', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('c8a55065fd87e2d4d834095a', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('44ce5c8d165507d3ad638810', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('368ed109035e1c8b663ed848', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('2210f39f4d6d9cf1ab0fe621', '498aeccd42448a02517cef20');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('2210f39f4d6d9cf1ab0fe621', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('bf92230c10d35f68e14aa333', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('86ec24d8b237bdedfd9e2f84', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('86ec24d8b237bdedfd9e2f84', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('c4021a71bd61e6bb43412fd2', '498aeccd42448a02517cef20');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('c4021a71bd61e6bb43412fd2', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('60ac494c696fc402db04908b', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('12252401b571865fbc3e5aff', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('df18a38e6f5561a16bd1e96a', '775d504713fa003ffe82a70e');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('dfeea7301df359e7ca736914', '5f5cdfeb83507e19503e7b7a');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('5e5b3aeb3f2fa1de1b527678', '498aeccd42448a02517cef20');
INSERT INTO "MemberTag" ("memberId", "tagId") VALUES ('ad9652d6681f945d2a919c46', '775d504713fa003ffe82a70e');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "status", "date", "createdAt", "updatedAt") VALUES
    ('5da908dfe976b6f0b6848d35', 'cb06a7106e9eeefb46b3471b', 'Member submission: Testimony 1', 'Submitted by a member for review.', 'audio',
     'https://media.grace.community/submissions/testimony-1.mp3', 600,
     '1b8c4090c0f4b3824809f893', 'draft', '2026-08-30 22:32:15', '2026-08-30 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Submission" ("id", "orgId", "memberId", "mediaItemId", "status", "note", "createdAt") VALUES
    ('d3b609a4aa06d4c22957b6ab', 'cb06a7106e9eeefb46b3471b', '1b8c4090c0f4b3824809f893', '5da908dfe976b6f0b6848d35', 'rejected', 'Audio quality too low', '2026-08-30 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "status", "date", "createdAt", "updatedAt") VALUES
    ('e984cd4fc0efbfd1ddd44540', 'cb06a7106e9eeefb46b3471b', 'Member submission: Testimony 2', 'Submitted by a member for review.', 'audio',
     'https://media.grace.community/submissions/testimony-2.mp3', 660,
     '34f58c950697d89fd853a919', 'draft', '2026-08-30 22:32:15', '2026-08-29 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Submission" ("id", "orgId", "memberId", "mediaItemId", "status", "note", "createdAt") VALUES
    ('0131de46bbfe917405868153', 'cb06a7106e9eeefb46b3471b', '34f58c950697d89fd853a919', 'e984cd4fc0efbfd1ddd44540', 'pending', NULL, '2026-08-29 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "status", "date", "createdAt", "updatedAt") VALUES
    ('793a32c218758d27eba87b5a', 'cb06a7106e9eeefb46b3471b', 'Member submission: Testimony 3', 'Submitted by a member for review.', 'audio',
     'https://media.grace.community/submissions/testimony-3.mp3', 720,
     'b84b4e0f29999922e771de6e', 'draft', '2026-08-30 22:32:15', '2026-08-28 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Submission" ("id", "orgId", "memberId", "mediaItemId", "status", "note", "createdAt") VALUES
    ('e3cabdade152ad6bb333151b', 'cb06a7106e9eeefb46b3471b', 'b84b4e0f29999922e771de6e', '793a32c218758d27eba87b5a', 'pending', NULL, '2026-08-28 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "status", "date", "createdAt", "updatedAt") VALUES
    ('ff1c5cc0541a0a00c7144ed5', 'cb06a7106e9eeefb46b3471b', 'Member submission: Testimony 4', 'Submitted by a member for review.', 'audio',
     'https://media.grace.community/submissions/testimony-4.mp3', 780,
     '425482f8e58de493ccc54316', 'draft', '2026-08-30 22:32:15', '2026-08-27 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Submission" ("id", "orgId", "memberId", "mediaItemId", "status", "note", "createdAt") VALUES
    ('9727599d75f13ccea125dc32', 'cb06a7106e9eeefb46b3471b', '425482f8e58de493ccc54316', 'ff1c5cc0541a0a00c7144ed5', 'rejected', 'Audio quality too low', '2026-08-27 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "status", "date", "createdAt", "updatedAt") VALUES
    ('b2d6e9f3fb67c0890a94087e', 'cb06a7106e9eeefb46b3471b', 'Member submission: Testimony 5', 'Submitted by a member for review.', 'audio',
     'https://media.grace.community/submissions/testimony-5.mp3', 840,
     'b684c0ae49bcecca26a3eb82', 'draft', '2026-08-30 22:32:15', '2026-08-26 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Submission" ("id", "orgId", "memberId", "mediaItemId", "status", "note", "createdAt") VALUES
    ('58e26fa580147931bfeb8eea', 'cb06a7106e9eeefb46b3471b', 'b684c0ae49bcecca26a3eb82', 'b2d6e9f3fb67c0890a94087e', 'pending', NULL, '2026-08-26 22:32:15');
INSERT INTO "MediaItem" ("id", "orgId", "title", "description", "type", "url", "duration", "speakerId", "status", "date", "createdAt", "updatedAt") VALUES
    ('9fb381953fd4f8e32eabfba7', 'cb06a7106e9eeefb46b3471b', 'Member submission: Testimony 6', 'Submitted by a member for review.', 'audio',
     'https://media.grace.community/submissions/testimony-6.mp3', 900,
     '79200677a14aea850d03684a', 'draft', '2026-08-30 22:32:15', '2026-08-25 22:32:15', '2026-08-30 22:32:15');
INSERT INTO "Submission" ("id", "orgId", "memberId", "mediaItemId", "status", "note", "createdAt") VALUES
    ('210d0099883e19281c139083', 'cb06a7106e9eeefb46b3471b', '79200677a14aea850d03684a', '9fb381953fd4f8e32eabfba7', 'pending', NULL, '2026-08-25 22:32:15');
INSERT INTO "VolunteerRole" ("id", "orgId", "groupId", "name", "capacity", "createdAt") VALUES
    ('eb4c69cc0b8637380c23d3c2', 'cb06a7106e9eeefb46b3471b', '535dc5080cd99a68b3be504a', 'Greeter', 4, '2026-08-30 22:32:15');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('d7496589b11f07db6a3475d9', '255f15c3d5484f5ec3954444', 'eb4c69cc0b8637380c23d3c2', '1b8c4090c0f4b3824809f893', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('ea63b5242b8a0d93635855cf', '255f15c3d5484f5ec3954444', 'eb4c69cc0b8637380c23d3c2', '34f58c950697d89fd853a919', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('6b3ff48b52209cff769b96d8', '255f15c3d5484f5ec3954444', 'eb4c69cc0b8637380c23d3c2', 'b84b4e0f29999922e771de6e', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('ca034ac4302fd020009f3701', '255f15c3d5484f5ec3954444', 'eb4c69cc0b8637380c23d3c2', '425482f8e58de493ccc54316', 'confirmed');
INSERT INTO "VolunteerRole" ("id", "orgId", "groupId", "name", "capacity", "createdAt") VALUES
    ('27e3eb025f20905d479ef7f5', 'cb06a7106e9eeefb46b3471b', 'ef4e09caf913ce3a221cbcbd', 'Usher', 6, '2026-08-30 22:32:15');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('73e500840830c00c09b1b1c1', '255f15c3d5484f5ec3954444', '27e3eb025f20905d479ef7f5', 'b684c0ae49bcecca26a3eb82', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('b37018c79548ad33b851f680', '255f15c3d5484f5ec3954444', '27e3eb025f20905d479ef7f5', '79200677a14aea850d03684a', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('43e005be755d2c62aa67f774', '255f15c3d5484f5ec3954444', '27e3eb025f20905d479ef7f5', '9feb413ed78a3d294a08253d', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('cb8617a98793eeb3fd4a8f25', '255f15c3d5484f5ec3954444', '27e3eb025f20905d479ef7f5', '331224d9de0d0e0468434f1c', 'confirmed');
INSERT INTO "VolunteerRole" ("id", "orgId", "groupId", "name", "capacity", "createdAt") VALUES
    ('f0145bc2f5878217993d0687', 'cb06a7106e9eeefb46b3471b', '260bb1835fc2d5d73b017091', 'Worship', 5, '2026-08-30 22:32:15');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('e5301f48077a7e94bfc854a7', '255f15c3d5484f5ec3954444', 'f0145bc2f5878217993d0687', '6600e5123058f8716f182931', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('c45da6e8e90c2996b49611dd', '255f15c3d5484f5ec3954444', 'f0145bc2f5878217993d0687', 'cddf8b1dfd7abef0363aab8c', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('e7111bcb1002a7557deb99ac', '255f15c3d5484f5ec3954444', 'f0145bc2f5878217993d0687', 'c37825a7aab3bf249e88ccb2', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('9c5760c5490ebe1a6d93628f', '255f15c3d5484f5ec3954444', 'f0145bc2f5878217993d0687', '1f614a022be735b859b4c57d', 'confirmed');
INSERT INTO "VolunteerRole" ("id", "orgId", "groupId", "name", "capacity", "createdAt") VALUES
    ('23c64e8ae8c3616b20244fc6', 'cb06a7106e9eeefb46b3471b', 'fc09ad4e5aa9d84c6dbea270', 'Children''s Worker', 3, '2026-08-30 22:32:15');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('504365325a54df9c4bb320b9', '255f15c3d5484f5ec3954444', '23c64e8ae8c3616b20244fc6', '8e3826ca094e2a32af591ecd', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('1daef3149b4773e8c991e037', '255f15c3d5484f5ec3954444', '23c64e8ae8c3616b20244fc6', '0ffeae5d0568e67a46a55034', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('e5e90aba96bb51485da7c2c7', '255f15c3d5484f5ec3954444', '23c64e8ae8c3616b20244fc6', '2cc63a0a17d5742a28c9b396', 'confirmed');
INSERT INTO "VolunteerRole" ("id", "orgId", "groupId", "name", "capacity", "createdAt") VALUES
    ('a9f61a1d6e7665e66ca9f9c3', 'cb06a7106e9eeefb46b3471b', 'ef10f49660024500ad021926', 'Sound Tech', 2, '2026-08-30 22:32:15');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('bd286985a0ea6a42666a06f1', '255f15c3d5484f5ec3954444', 'a9f61a1d6e7665e66ca9f9c3', '1bc1e6ba6648a3c8908e82ce', 'confirmed');
INSERT INTO "VolunteerAssignment" ("id", "eventId", "roleId", "memberId", "status") VALUES
        ('cf5d5a65997c421037d69d2f', '255f15c3d5484f5ec3954444', 'a9f61a1d6e7665e66ca9f9c3', '3e4fc0445408e5a9cae678ff', 'confirmed');
INSERT INTO "AuditLog" ("id", "orgId", "adminId", "action", "entity", "detail", "createdAt") VALUES
  ('36436f04deefacad93c5b0e5', 'cb06a7106e9eeefb46b3471b', '1c5ae7dd85bff378c4fd2814', 'seed', 'system', 'Database seeded with demo data', '2026-08-30 22:32:15');
INSERT INTO "AuditLog" ("id", "orgId", "adminId", "action", "entity", "detail", "createdAt") VALUES
  ('b557cf220409366ad25860f7', 'cb06a7106e9eeefb46b3471b', '1c5ae7dd85bff378c4fd2814', 'reminder.dispatched', 'event', 'Simulated email + SMS reminders dispatched (8 emails, 8 SMS)', '2026-08-30 22:32:15');
COMMIT;