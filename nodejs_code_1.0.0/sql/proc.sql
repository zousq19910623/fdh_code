/*ɾ������ʱ������*/
DELIMITER $$

DROP PROCEDURE IF EXISTS delete_dynamic$$
CREATE PROCEDURE delete_dynamic(uId INT(10), dId INT(10))
BEGIN

	DECLARE error INTEGER DEFAULT 0;  
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET error=1;
	
	START TRANSACTION;
		/*ɾ������*/
		DELETE FROM Dynamic WHERE DynamicID = dId and UserID = uId;
		/*ɾ�����Ӷ�Ӧ��������*/
		DELETE FROM DynamicTimes WHERE DynamicID = dId;
		/*ɾ�����Ӷ�Ӧ����*/
		DELETE FROM Comment WHERE DynamicID = dId;
		/*ɾ�����ӱ�ϲ��������*/
		DELETE FROM FondDynamic WHERE FondDynamicID = dId;
		
	
	IF error = 1 THEN
		ROLLBACK;
	ELSE
		COMMIT;
	END IF;

END $$

DELIMITER;