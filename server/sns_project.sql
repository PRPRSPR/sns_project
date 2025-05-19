-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.41 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 테이블 sns_project_db.comments 구조 내보내기
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `diary_id` int NOT NULL,
  `parent_comment_id` int DEFAULT NULL,
  `comment` text NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `diary_id` (`diary_id`),
  KEY `parent_comment_id` (`parent_comment_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`diary_id`) REFERENCES `diaries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sns_project_db.comments:~17 rows (대략적) 내보내기
INSERT INTO `comments` (`id`, `email`, `diary_id`, `parent_comment_id`, `comment`, `is_deleted`, `created_at`, `updated_at`) VALUES
	(11, 'user1@example.com', 16, NULL, '정말 공감되는 하루네요!', 0, '2025-05-08 01:55:41', '2025-05-08 01:55:41'),
	(12, 'user2@example.com', 16, NULL, '기분이 좋아 보여요!', 0, '2025-05-08 01:55:41', '2025-05-08 01:55:41'),
	(13, 'user3@example.com', 17, NULL, '긴 하루였겠네요!', 0, '2025-05-08 01:55:41', '2025-05-08 01:55:41'),
	(14, 'user1@example.com', 18, NULL, '친구와의 만남은 언제나 즐겁죠!', 0, '2025-05-08 01:55:41', '2025-05-08 01:55:41'),
	(16, 'user2@example.com', 18, 14, '맞아요 ㅎㅎ', 0, '2025-05-08 01:56:06', '2025-05-08 01:56:06'),
	(28, 'test@test.com', 42, NULL, '댓글 테스트', 0, '2025-05-15 05:36:39', '2025-05-15 05:38:17'),
	(29, 'test@test.com', 42, 28, '답글 테스트', 0, '2025-05-15 05:38:25', '2025-05-15 05:38:25'),
	(30, 'test@test.com', 42, 29, '답글의 답글', 0, '2025-05-15 05:38:34', '2025-05-15 05:38:34'),
	(31, 'test@test.com', 42, 30, '답글의 답글의 답글', 0, '2025-05-15 05:38:44', '2025-05-15 05:38:44'),
	(32, 'test@test.com', 42, 31, '답글의 답글의 답글의 답글', 0, '2025-05-15 05:38:52', '2025-05-15 05:38:52'),
	(33, 'test@test.com', 42, 30, '답글의 답글의 답글 2', 0, '2025-05-15 05:39:13', '2025-05-15 05:39:13'),
	(34, 'test@test.com', 42, NULL, '대댓ㄷ샛댇ㄷ대 댓글 수정 테스트', 0, '2025-05-15 05:39:40', '2025-05-15 05:39:59'),
	(35, 'test@test.com', 42, 34, '삭제 테스트', 1, '2025-05-15 05:40:08', '2025-05-15 05:48:58'),
	(36, 'test@test.com', 42, 32, '답글의 답글의 답글의 답글의 답글', 0, '2025-05-15 05:59:29', '2025-05-15 05:59:29'),
	(37, 'test@test.com', 42, 35, '뭔데 삭제됐을까요?', 0, '2025-05-15 09:50:56', '2025-05-15 09:50:56'),
	(38, 'test@test.com', 16, NULL, '다른 사람의 일기는 수정하거나 삭제할 수 없어요.', 0, '2025-05-15 09:51:36', '2025-05-15 09:51:52'),
	(39, 'test@test.com', 16, 38, '그건 댓글과 답글도 마찬가지에요.', 0, '2025-05-15 09:51:46', '2025-05-15 09:51:46');

-- 테이블 sns_project_db.diaries 구조 내보내기
CREATE TABLE IF NOT EXISTS `diaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `memo` text,
  `emotion_tag` varchar(50) DEFAULT NULL,
  `editable_until` datetime DEFAULT NULL COMMENT '수정 가능 시간',
  `is_deleted` tinyint DEFAULT '0',
  `is_private` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  CONSTRAINT `diaries_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sns_project_db.diaries:~13 rows (대략적) 내보내기
INSERT INTO `diaries` (`id`, `email`, `date`, `memo`, `emotion_tag`, `editable_until`, `is_deleted`, `is_private`, `created_at`, `updated_at`) VALUES
	(16, 'test2@test.com', '2025-05-07', '오늘은 기분이 참 좋았어요!', 'happy', '2025-05-09 10:43:23', 0, 0, '2025-05-08 01:43:23', '2025-05-15 07:59:47'),
	(17, 'test3@test.com', '2025-05-07', '일이 많아서 피곤한 하루였어요.', 'tired', '2025-05-09 10:43:23', 0, 1, '2025-05-08 01:43:23', '2025-05-15 08:00:01'),
	(18, 'user1@example.com', '2025-05-06', '산책하면서 봄 내음을 느꼈어요.', 'relaxed', '2025-05-09 10:43:23', 0, 0, '2025-05-08 01:43:23', '2025-05-08 01:43:23'),
	(19, 'user3@example.com', '2025-05-05', '슬픈 일이 있었지만 잘 견뎠어요.', 'sad', '2025-05-09 10:43:23', 0, 1, '2025-05-08 01:43:23', '2025-05-08 01:43:23'),
	(20, 'user2@example.com', '2025-05-04', '좋은 사람들과 식사를 했어요!', 'joyful', '2025-05-09 10:43:23', 0, 0, '2025-05-08 01:43:23', '2025-05-08 01:43:23'),
	(22, 'test@test.com', '2025-05-06', '어제는 조금 우울했다. 비가 왔고 할 일이 많았다.', 'sad', '2025-05-09 10:58:42', 0, 0, '2025-05-08 01:58:42', '2025-05-08 01:58:42'),
	(26, 'test@test.com', '2025-05-02', '집ㅂ에가쟈ㅏㅏ', 'tired', '2025-05-09 20:50:36', 0, 0, '2025-05-08 11:50:36', '2025-05-08 11:50:36'),
	(27, 's.subin.0208@gmail.com', '2025-05-09', '히ㅣㅎ아묻튼됐다이거에여ㅕ하ㅏ하', 'happy', '2025-05-10 12:11:54', 0, 0, '2025-05-09 03:11:54', '2025-05-09 03:11:54'),
	(28, 's.subin.0208@gmail.com', '2025-05-01', 'ㅁㄴㅇㄻㅇㅁㄴㅇㅁㄴㅇㅁ', 'excited', '2025-05-10 12:13:09', 0, 0, '2025-05-09 03:13:09', '2025-05-09 03:13:09'),
	(41, 'test@test.com', '2025-05-14', 'ㄹㄹㄹㄹ? ㅇㅇ', 'excited', '2025-05-15 15:43:42', 0, 0, '2025-05-14 06:43:42', '2025-05-14 08:39:13'),
	(42, 'test@test.com', '2025-05-07', '게시글 테스트 입니다.\n수정 테스트 입니다.', 'happy', '2025-05-16 13:15:03', 0, 0, '2025-05-15 04:15:03', '2025-05-15 04:15:19'),
	(43, 'test@test.com', '2025-05-15', '해ㅐ냈다ㅏㅏㅏㅏㅏㅏㅏㅏ!!!!ㅏㅣㅏ이ㅏ;ㅣ암;ㅣㅏㅇㅁ;ㅏㅇ!!!', 'excited', '2025-05-16 18:55:38', 0, 0, '2025-05-15 09:55:38', '2025-05-15 09:55:38'),
	(44, 'test@test.com', '2025-05-13', '집에 보내조', 'tired', '2025-05-16 20:17:11', 0, 0, '2025-05-15 11:17:11', '2025-05-15 11:17:11');

-- 테이블 sns_project_db.friends 구조 내보내기
CREATE TABLE IF NOT EXISTS `friends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(255) NOT NULL,
  `friend_email` varchar(255) NOT NULL,
  `status` enum('pending','accepted','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending' COMMENT '요청/수락/거절(삭제)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sns_project_db.friends:~7 rows (대략적) 내보내기
INSERT INTO `friends` (`id`, `user_email`, `friend_email`, `status`, `created_at`) VALUES
	(18, 'test@test.com', 'test3@test.com', 'rejected', '2025-05-12 04:06:39'),
	(22, 'test@test.com', 'test5@test.com', 'pending', '2025-05-12 10:32:43'),
	(23, 'test@test.com', 'test4@test.com', 'pending', '2025-05-12 10:32:44'),
	(28, 'test2@test.com', 'test5@test.com', 'pending', '2025-05-12 11:28:17'),
	(29, 'test2@test.com', 'test4@test.com', 'pending', '2025-05-12 11:28:18'),
	(30, 'test2@test.com', 'test@test.com', 'accepted', '2025-05-12 11:28:18'),
	(31, 'test@test.com', 'test2@test.com', 'accepted', '2025-05-12 11:28:41');

-- 테이블 sns_project_db.media 구조 내보내기
CREATE TABLE IF NOT EXISTS `media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `diaryId` int NOT NULL,
  `mediaPath` varchar(255) NOT NULL,
  `mediaType` enum('image','video') NOT NULL,
  `thumbnailYn` char(1) DEFAULT 'N',
  `mediaOrder` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `diaryId` (`diaryId`),
  CONSTRAINT `media_ibfk_1` FOREIGN KEY (`diaryId`) REFERENCES `diaries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sns_project_db.media:~33 rows (대략적) 내보내기
INSERT INTO `media` (`id`, `diaryId`, `mediaPath`, `mediaType`, `thumbnailYn`, `mediaOrder`, `createdAt`) VALUES
	(11, 16, 'uploads/diary1_img1.jpg', 'image', 'Y', 0, '2025-05-08 10:52:35'),
	(12, 16, 'uploads/diary1_img2.jpg', 'image', 'N', 1, '2025-05-08 10:52:35'),
	(13, 17, 'uploads/diary2_video.mp4', 'video', 'Y', 0, '2025-05-08 10:52:35'),
	(14, 18, 'uploads/diary3_img1.jpg', 'image', 'Y', 0, '2025-05-08 10:52:35'),
	(15, 19, 'uploads/diary4_img1.jpg', 'image', 'Y', 0, '2025-05-08 10:52:35'),
	(23, 22, 'uploads/20250506_sad.mp4', 'video', 'Y', 0, '2025-05-08 10:59:01'),
	(24, 26, 'uploads/1746705036219-diary2_video.mp4', 'video', 'N', 0, '2025-05-08 20:50:36'),
	(25, 26, 'uploads/1746705036292-diary4_img1.jpg', 'image', 'N', 1, '2025-05-08 20:50:36'),
	(26, 26, 'uploads/1746705036307-clay-banks-jYeznJBMC80-unsplash.jpg', 'image', 'Y', 2, '2025-05-08 20:50:36'),
	(27, 26, 'uploads/1746705036320-madalyn-cox-BIquUeBgwrM-unsplash.jpg', 'image', 'N', 3, '2025-05-08 20:50:36'),
	(28, 27, 'uploads/1746760314299-25020622.jpg', 'image', 'N', 0, '2025-05-09 12:11:54'),
	(29, 27, 'uploads/1746760314312-250205 (2).jpg', 'image', 'N', 1, '2025-05-09 12:11:54'),
	(30, 27, 'uploads/1746760314321-OIP.jpg', 'image', 'Y', 2, '2025-05-09 12:11:54'),
	(31, 27, 'uploads/1746760314329-250205 (3).jpg', 'image', 'N', 3, '2025-05-09 12:11:54'),
	(32, 28, 'uploads/1746760389034-diary2_video.mp4', 'video', 'N', 0, '2025-05-09 12:13:09'),
	(33, 28, 'uploads/1746760389095-20250507_happy2.jpg', 'image', 'N', 1, '2025-05-09 12:13:09'),
	(34, 28, 'uploads/1746760389121-diary1_img1.jpg', 'image', 'N', 2, '2025-05-09 12:13:09'),
	(35, 28, 'uploads/1746760389134-20250507_happy1.jpg', 'image', 'N', 3, '2025-05-09 12:13:09'),
	(36, 28, 'uploads/1746760389145-diary1_img2.jpg', 'image', 'Y', 4, '2025-05-09 12:13:09'),
	(37, 28, 'uploads/1746760389171-diary4_img1.jpg', 'image', 'N', 5, '2025-05-09 12:13:09'),
	(49, 41, 'uploads/1747205022242-diary1_img1.jpg', 'image', 'Y', 0, '2025-05-14 15:43:42'),
	(50, 41, 'uploads/1747205022260-diary4_img1.jpg', 'image', 'N', 1, '2025-05-14 15:43:42'),
	(51, 42, 'uploads/1747282503031-20250507_happy2.jpg', 'image', 'Y', 0, '2025-05-15 13:15:03'),
	(52, 42, 'uploads/1747282503062-20250507_happy1.jpg', 'image', 'N', 1, '2025-05-15 13:15:03'),
	(53, 42, 'uploads/1747282503075-diary1_img1.jpg', 'image', 'N', 2, '2025-05-15 13:15:03'),
	(54, 42, 'uploads/1747282503091-diary3_img1.jpg', 'image', 'N', 3, '2025-05-15 13:15:03'),
	(55, 43, 'uploads/1747302938206-diary1_img1.jpg', 'image', 'N', 0, '2025-05-15 18:55:38'),
	(56, 43, 'uploads/1747302938228-diary4_img1.jpg', 'image', 'N', 1, '2025-05-15 18:55:38'),
	(57, 43, 'uploads/1747302938240-250207vkeh.jpg', 'image', 'N', 2, '2025-05-15 18:55:38'),
	(58, 43, 'uploads/1747302938260-clay-banks-jYeznJBMC80-unsplash.jpg', 'image', 'N', 3, '2025-05-15 18:55:38'),
	(59, 43, 'uploads/1747302938271-250205 (2).jpg', 'image', 'Y', 4, '2025-05-15 18:55:38'),
	(60, 43, 'uploads/1747302938280-250205 (3).jpg', 'image', 'N', 5, '2025-05-15 18:55:38'),
	(61, 44, 'uploads/1747307831415-250207cjdthfah.jpg', 'image', 'Y', 0, '2025-05-15 20:17:11');

-- 테이블 sns_project_db.messages 구조 내보내기
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_email` varchar(255) NOT NULL,
  `receiver_email` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  `media_url` varchar(500) DEFAULT NULL,
  `media_type` enum('image','video','file') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_email` (`sender_email`),
  KEY `receiver_email` (`receiver_email`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_email`) REFERENCES `users` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sns_project_db.messages:~6 rows (대략적) 내보내기
INSERT INTO `messages` (`id`, `sender_email`, `receiver_email`, `content`, `created_at`, `is_read`, `media_url`, `media_type`) VALUES
	(6, 'test2@test.com', 'test@test.com', 'pdf 파일', '2025-05-13 10:30:01', 1, 'uploads\\messages\\1747132201428-3ì¥.pdf', 'file'),
	(7, 'test2@test.com', 'test@test.com', '이미지랑 같이!', '2025-05-13 10:30:19', 1, 'uploads\\messages\\1747132219962-20250507_happy2.jpg', 'image'),
	(8, 'test2@test.com', 'test@test.com', '영상이랑 같이', '2025-05-13 10:34:11', 1, 'uploads\\messages\\1747132451858-20250506_sad.mp4', 'video'),
	(9, 'test2@test.com', 'test@test.com', '이게 채팅이 된다고??????????????????????????????????????????', '2025-05-13 10:35:15', 1, NULL, NULL),
	(10, 'test2@test.com', 'test@test.com', '가나다라마바사', '2025-05-13 10:39:10', 1, NULL, NULL),
	(12, 'test2@test.com', 'test@test.com', '줄바꿈 테스트\r\n\r\n줄\r\n바\r\n꿈\r\n테스트', '2025-05-13 10:50:24', 1, NULL, NULL);

-- 테이블 sns_project_db.notifications 구조 내보내기
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(255) NOT NULL,
  `sender_email` varchar(255) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_email` (`user_email`),
  KEY `sender_email` (`sender_email`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_email`) REFERENCES `users` (`email`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sns_project_db.notifications:~17 rows (대략적) 내보내기
INSERT INTO `notifications` (`id`, `user_email`, `sender_email`, `type`, `message`, `link`, `is_read`, `created_at`) VALUES
	(11, 'test2@test.com', 'test@test.com', 'friend_request', '김하나님이 친구 요청을 보냈습니다.', '/profile/test@test.com', 0, '2025-05-12 04:06:39'),
	(12, 'test3@test.com', 'test@test.com', 'friend_request', '김하나님이 친구 요청을 보냈습니다.', '/profile/test@test.com', 1, '2025-05-12 04:06:39'),
	(16, 'test5@test.com', 'test@test.com', 'friend_request', '김하나님이 친구 요청을 보냈습니다.', '/profile/test@test.com', 0, '2025-05-12 10:32:43'),
	(17, 'test4@test.com', 'test@test.com', 'friend_request', '김하나님이 친구 요청을 보냈습니다.', '/profile/test@test.com', 0, '2025-05-12 10:32:44'),
	(18, 'test4@test.com', 'test2@test.com', 'friend_request', '이두나님이 친구 요청을 보냈습니다.', '/profile/test2@test.com', 0, '2025-05-12 10:38:23'),
	(19, 'test3@test.com', 'test2@test.com', 'friend_request', '이두나님이 친구 요청을 보냈습니다.', '/profile/test2@test.com', 0, '2025-05-12 10:38:24'),
	(20, 'test5@test.com', 'test2@test.com', 'friend_request', '이두나님이 친구 요청을 보냈습니다.', '/profile/test2@test.com', 0, '2025-05-12 10:38:25'),
	(21, 'test3@test.com', 'test2@test.com', 'friend_request', '이두나님이 친구 요청을 보냈습니다.', '/profile/test2@test.com', 0, '2025-05-12 11:28:15'),
	(22, 'test5@test.com', 'test2@test.com', 'friend_request', '이두나님이 친구 요청을 보냈습니다.', '/profile/test2@test.com', 0, '2025-05-12 11:28:17'),
	(23, 'test4@test.com', 'test2@test.com', 'friend_request', '이두나님이 친구 요청을 보냈습니다.', '/profile/test2@test.com', 0, '2025-05-12 11:28:18'),
	(24, 'test@test.com', 'test2@test.com', 'friend_request', '이두나님이 친구 요청을 보냈습니다.', '/profile/test2@test.com', 0, '2025-05-12 11:28:18'),
	(25, 'aaaasss8979yy@gmail.com', 'test@test.com', 'friend_request', '김하나님이 친구 요청을 보냈습니다.', '/profile/test@test.com', 0, '2025-05-13 01:50:43'),
	(26, 's.subin.0208@gmail.com', 'test3@test.com', 'friend_request', '서세나님이 친구 요청을 보냈습니다.', '/profile/test3@test.com', 0, '2025-05-13 02:16:08'),
	(27, 'test@test.com', 'test3@test.com', 'friend_request', '서세나님이 친구 요청을 보냈습니다.', '/profile/test3@test.com', 0, '2025-05-13 02:16:23'),
	(28, 'test@test.com', 'test3@test.com', 'friend_request', '서세나님이 친구 요청을 보냈습니다.', '/profile/test3@test.com', 0, '2025-05-13 04:15:53'),
	(29, 's.subin.0208@gmail.com', 'test@test.com', 'friend_request', '김하나님이 친구 요청을 보냈습니다.', '/profile/test@test.com', 0, '2025-05-13 07:25:59'),
	(30, 's.subin.0208@gmail.com', 'test@test.com', 'friend_request', '김하나님이 친구 요청을 보냈습니다.', '/profile/test@test.com', 0, '2025-05-13 07:26:06');

-- 테이블 sns_project_db.reactions 구조 내보내기
CREATE TABLE IF NOT EXISTS `reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `diary_id` int NOT NULL,
  `reaction_type` enum('like','love','sad','angry','surprised','funny','clap') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `diary_id` (`diary_id`),
  CONSTRAINT `reactions_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `reactions_ibfk_2` FOREIGN KEY (`diary_id`) REFERENCES `diaries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sns_project_db.reactions:~6 rows (대략적) 내보내기
INSERT INTO `reactions` (`id`, `email`, `diary_id`, `reaction_type`, `created_at`) VALUES
	(1, 'test@test.com', 16, 'like', '2025-05-08 01:55:41'),
	(2, 'test3@test.com', 16, 'love', '2025-05-08 01:55:41'),
	(3, 'test@test.com', 17, 'sad', '2025-05-08 01:55:41'),
	(4, 'test2@test.com', 17, 'surprised', '2025-05-08 01:55:41'),
	(5, 'test2@test.com', 42, 'like', '2025-05-08 01:55:41'),
	(6, 'test3@test.com', 42, 'love', '2025-05-08 01:55:41');

-- 테이블 sns_project_db.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `email` varchar(255) NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `nickname` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `profile_image` text,
  `bio` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sns_project_db.users:~10 rows (대략적) 내보내기
INSERT INTO `users` (`email`, `password`, `nickname`, `profile_image`, `bio`, `created_at`, `updated_at`) VALUES
	('aaaasss8979yy@gmail.com', NULL, '신파랑', 'https://lh3.googleusercontent.com/a/ACg8ocKamleS33exZlFKdshUfefefmQBoLaiX3FQJQ9R90MaACMCFb_q=s96-c', NULL, '2025-05-09 09:16:36', '2025-05-09 09:16:36'),
	('s.subin.0208@gmail.com', NULL, '신수빈', 'https://lh3.googleusercontent.com/a/ACg8ocKKRhiOuZK7W9iyIRz8GsqTPtzDMwbxzN1TQuB_xqBDPC3L8lX2=s96-c', NULL, '2025-05-09 02:33:09', '2025-05-09 02:33:09'),
	('test@test.com', '$2b$10$Xxv7puuRHihTohfK/qLMCOhMjV4L/BHsXY6D7OUCr1ntzn9.OSrHy', '김하나', 'uploads\\profile\\1747191799406-250205 (3).jpg', '고양이 프사는 성공한다', '2025-05-08 01:08:42', '2025-05-14 03:03:19'),
	('test2@test.com', '$2b$10$Dc7VP.briKulWG5CvO7ZWuWAJJjBZCVq.3qyA2yrI1j2SugxycE0.', '이두나', NULL, NULL, '2025-05-09 09:11:52', '2025-05-09 09:11:52'),
	('test3@test.com', '$2b$10$hhb8zpwjauevFhAMilkbR.ShERwq9si/4q1WrylAeh9sLnJwZKsVO', '서세나', NULL, NULL, '2025-05-09 09:13:15', '2025-05-09 09:13:15'),
	('test4@test.com', '$2b$10$bEFJ95WJBnXBfoptLi9lcezT2MtE68QjcRPKBM3fqTYFyE13Sb9j6', '남사나', NULL, NULL, '2025-05-09 09:15:11', '2025-05-09 09:15:11'),
	('test5@test.com', '$2b$10$hG8Of45kIDu9S13Lwpub7eDVkZb7Xt5ftPuh4fbEc5JTMRKWT5v1m', '단온아', NULL, NULL, '2025-05-09 09:16:22', '2025-05-09 09:16:22'),
	('user1@example.com', '$2b$10$Xxv7puuRHihTohfK/qLMCOhMjV4L/BHsXY6D7OUCr1ntzn9.OSrHy', 'User One', NULL, NULL, '2025-05-08 01:43:23', '2025-05-08 01:43:33'),
	('user2@example.com', '$2b$10$Xxv7puuRHihTohfK/qLMCOhMjV4L/BHsXY6D7OUCr1ntzn9.OSrHy', 'User Two', NULL, NULL, '2025-05-08 01:43:23', '2025-05-08 01:43:33'),
	('user3@example.com', '$2b$10$Xxv7puuRHihTohfK/qLMCOhMjV4L/BHsXY6D7OUCr1ntzn9.OSrHy', 'User Three', NULL, NULL, '2025-05-08 01:43:23', '2025-05-08 01:43:34');

-- 트리거 sns_project_db.set_editable_until 구조 내보내기
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `set_editable_until` BEFORE INSERT ON `diaries` FOR EACH ROW BEGIN
    SET NEW.editable_until = NOW() + INTERVAL 1 DAY;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
