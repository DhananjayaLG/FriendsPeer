// db.js
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const getDBConnection = async () => {
  return await SQLite.openDatabase({ name: 'posts.db', location: 'default' });
};

// Create table if it doesn't exist
const createTable = async () => {
  const db = await getDBConnection();
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS posts (
      postId INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      image TEXT,
      createdAt TEXT,
      likedBy TEXT,
      comments TEXT
    );
  `);
};
const getMaxPostId = async () => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(`SELECT MAX(postId) as maxId FROM posts`);
  if (results.rows.length > 0) {
    return results.rows.item(0).maxId;
  }
  return null;
};


// Insert a post
const insertPost = async (post) => {
  const db = await getDBConnection();
  const { text, image, createdAt, likedBy, comments } = post;
  await db.executeSql(
    `INSERT OR REPLACE INTO posts ( text, image, createdAt, likedBy, comments)
     VALUES ( ?, ?, ?, ?, ?)`,
    [
      text,
      image,
      createdAt,
      JSON.stringify(likedBy),
      JSON.stringify(comments),
    ]
  );
};

// Get post by postId
const getPostById = async (postId) => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(`SELECT * FROM posts WHERE postId = ?`, [postId]);
  if (results.rows.length > 0) {
    const row = results.rows.item(0);
    return {
      postId: row.postId,
      text: row.text,
      image: row.image,
      createdAt: row.createdAt,
      likedBy: JSON.parse(row.likedBy),
      comments: JSON.parse(row.comments),
    };
  }
  return null;
};

// Update likedBy or comments
// Update only likedBy
const addLikedByToPost = async (postId, newLike) => {
  const db = await getDBConnection();

  // Step 1: Get current likedBy
  const [results] = await db.executeSql(`SELECT likedBy FROM posts WHERE postId = ?`, [postId]);

  if (results.rows.length === 0) return; // No post found

  let likedBy = [];
  try {
    const row = results.rows.item(0);
    likedBy = JSON.parse(row.likedBy) || [];
  } catch (e) {
    likedBy = [];
  }

  // Step 2: Add the new like (prevent duplicates if needed)
  if (!likedBy.includes(newLike)) {
    likedBy.push(newLike);
  }

  // Step 3: Save updated likedBy array
  await db.executeSql(
    `UPDATE posts SET likedBy = ? WHERE postId = ?`,
    [JSON.stringify(likedBy), postId]
  );
};

const removeLikedByFromPost = async (postId, userIdToRemove) => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(`SELECT likedBy FROM posts WHERE postId = ?`, [postId]);

  if (results.rows.length === 0) return;

  let likedBy = [];
  try {
    likedBy = JSON.parse(results.rows.item(0).likedBy) || [];
  } catch {
    likedBy = [];
  }

  likedBy = likedBy.filter(userId => userId !== userIdToRemove);

  await db.executeSql(
    `UPDATE posts SET likedBy = ? WHERE postId = ?`,
    [JSON.stringify(likedBy), postId]
  );
};


// Update only comments
// const updateComments = async (postId, comments) => {
//   const db = await getDBConnection();
//   await db.executeSql(
//     `UPDATE posts SET comments = ? WHERE postId = ?`,
//     [JSON.stringify(comments), postId]
//   );
// };

const updateComments = async (postId, newComment) => {
  const db = await getDBConnection();

  // Step 1: Get existing comments
  const [results] = await db.executeSql(`SELECT comments FROM posts WHERE postId = ?`, [postId]);

  if (results.rows.length === 0) return;

  let comments = [];
  const row = results.rows.item(0);

  try {
    comments = JSON.parse(row.comments) || [];
  } catch (e) {
    comments = [];
  }

  // Step 2: Add new comment
  comments.push(newComment);

  // Step 3: Update the database
  await db.executeSql(
    `UPDATE posts SET comments = ? WHERE postId = ?`,
    [JSON.stringify(comments), postId]
  );
};



// Delete post by postId
const deletePostById = async (postId) => {
  const db = await getDBConnection();
  await db.executeSql(`DELETE FROM posts WHERE postId = ?`, [postId]);
};

// Get all posts
const getPosts = async () => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(`SELECT * FROM posts ORDER BY postId DESC`);
  const posts = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    posts.push({
      postId: row.postId,
      text: row.text,
      image: row.image,
      createdAt: row.createdAt,
      likedBy: JSON.parse(row.likedBy),
      comments: JSON.parse(row.comments),
    });
  }
  return posts;
};


// Create friends table
const createFriendsTable = async () => {
  const db = await getDBConnection();
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY,
      name TEXT,
      profile TEXT
    );
  `);
};

// Add or replace a friend
const addFriend = async ({ id, name, profile }) => {
  const db = await getDBConnection();
  await db.executeSql(
    `INSERT OR REPLACE INTO friends (id, name, profile) VALUES (?, ?, ?)`,
    [id.trim(), name.trim(), profile || ""]
  );
};

// Delete friend by ID
const deleteFriendById = async (id) => {
  const db = await getDBConnection();
  await db.executeSql(`DELETE FROM friends WHERE id = ?`, [id.trim()]);
};

// Update profile by friend ID
const updateFriendProfilePhoto = async (id, newProfile) => {
  const db = await getDBConnection();
  await db.executeSql(
    `UPDATE friends SET profile = ? WHERE id = ?`,
    [newProfile, id.trim()]
  );
};

// Optional: Get all friends
const getAllFriends = async () => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(`SELECT * FROM friends ORDER BY ROWID DESC`);
  const friends = [];
  for (let i = 0; i < results.rows.length; i++) {
    friends.push(results.rows.item(i));
  }
  return friends;
};


const tableExists = async (tableName) => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [tableName]
  );
  return results.rows.length > 0;
};
// Create user table
const createUserTable = async () => {
  const db = await getDBConnection();
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      name TEXT,
      profile TEXT,
      isLoggedIn INTEGER
    );
  `);

  // Insert default row if it doesn't exist
  const [results] = await db.executeSql(`SELECT COUNT(*) as count FROM user`);
  if (results.rows.item(0).count === 0) {
    await db.executeSql(
      `INSERT INTO user (id, name, profile, isLoggedIn) VALUES (1, '', '', 0)`
    );
  }
};

// ✅ Update name
const updateUserName = async (name) => {
  const db = await getDBConnection();
  await db.executeSql(`UPDATE user SET name = ? WHERE id = 1`, [name]);
};

// ✅ Update profile photo (base64)
const updateUserProfilePhoto = async (base64Photo) => {
  const db = await getDBConnection();
  await db.executeSql(`UPDATE user SET profile = ? WHERE id = 1`, [base64Photo]);
};

// ✅ Update login state
const updateUserLoginState = async (isLoggedIn) => {
  const db = await getDBConnection();
  await db.executeSql(`UPDATE user SET isLoggedIn = ? WHERE id = 1`, [isLoggedIn ? 1 : 0]);
};

// ✅ Get user data
const getUserData = async () => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(`SELECT * FROM user WHERE id = 1`);
  if (results.rows.length > 0) {
    const row = results.rows.item(0);
    return {
      name: row.name,
      profile: row.profile,
      isLoggedIn: row.isLoggedIn === 1,
    };
  }
  return null;
};





export {
  createTable,
  insertPost,
  getPosts,
  getPostById,
  addLikedByToPost,
  removeLikedByFromPost,
  updateComments,
  deletePostById,
  createFriendsTable,
  addFriend,
  deleteFriendById,
  updateFriendProfilePhoto,
  getAllFriends,
  tableExists,
  createUserTable,
  updateUserName,
  updateUserProfilePhoto,
  updateUserLoginState,
  getUserData,
  getMaxPostId
};
