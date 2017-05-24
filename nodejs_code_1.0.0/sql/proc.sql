/*删除帖子时事务处理*/
DELIMITER $$

DROP PROCEDURE IF EXISTS delete_dynamic$$
CREATE PROCEDURE delete_dynamic(uId INT(10), dId INT(10))
BEGIN

	DECLARE error INTEGER DEFAULT 0;  
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET error=1;
	
	START TRANSACTION;
		/*删除帖子*/
		DELETE FROM Dynamic WHERE DynamicID = dId and UserID = uId;
		/*删除帖子对应次数数据*/
		DELETE FROM DynamicTimes WHERE DynamicID = dId;
		/*删除帖子对应评论*/
		DELETE FROM Comment WHERE DynamicID = dId;
		/*删除帖子被喜欢的数据*/
		DELETE FROM FondDynamic WHERE FondDynamicID = dId;
		
	
	IF error = 1 THEN
		ROLLBACK;
	ELSE
		COMMIT;
	END IF;

END $$

DELIMITER;