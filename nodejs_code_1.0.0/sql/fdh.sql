/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2017/4/19 19:19:21                           */
/*==============================================================*/


drop table if exists Collect;

drop table if exists Comment;

drop table if exists Dynamic;

drop table if exists DynamicTimes;

drop table if exists Focus;

drop table if exists FondDynamic;

drop table if exists Notice;

drop table if exists Report;

drop table if exists UserInfo;

drop table if exists UserTimes;

/*==============================================================*/
/* Table: Collect                                               */
/*==============================================================*/
create table Collect
(
   ID                   int not null auto_increment comment '������ID(����)',
   UserID               int not null comment '�ղ���ID',
   DynamicID            int not null comment '����ID',
   CollectTime          datetime not null comment '�ղص�ʱ��',
   primary key (ID)
)
type = MYISAM;

alter table Collect comment '�ղر�';

/*==============================================================*/
/* Table: Comment                                               */
/*==============================================================*/
create table Comment
(
   CommentID            int not null auto_increment comment '����ID',
   DynamicID            int not null comment '����ID',
   CommentUserID        int not null comment '�����û�ID',
   CommentName          varchar(20) not null,
   CommentContent       varchar(200) not null comment '��������',
   CommentTime          datetime not null comment '����ʱ��',
   BeCommentUserID      int not null comment '�����۵��û�ID',
   BeCommentName        varchar(20) not null,
   BeCommentID          int not null,
   BelongCommentID      int not null comment '��������������',
   primary key (CommentID)
)
type = MYISAM;

alter table Comment comment '���۱�';

/*==============================================================*/
/* Table: Dynamic                                               */
/*==============================================================*/
create table Dynamic
(
   DynamicID            int not null auto_increment comment '����ID',
   UserID               int not null comment '�û�ID',
   HeadIconPath         varchar(100) not null comment 'ͷ��·��',
   NickName             varchar(20) not null comment '�ǳ�',
   Content              varchar(2000) not null comment '����',
   CreateTime           datetime not null comment '����ʱ��',
   Location             varchar(100) not null comment '����λ��',
   PicturePath          varchar(900) not null comment '����ͼ����·��',
   Longitude            double not null comment '����',
   Latitude             double not null comment 'γ��',
   ReadTimes            int not null comment '�Ķ�����',
   FondTimes            int not null comment 'ϲ������',
   ShareTimes           int not null comment '�������',
   primary key (DynamicID)
)
type = InnoDB;

alter table Dynamic comment '���ӵı�ṹ';

/*==============================================================*/
/* Table: DynamicTimes                                          */
/*==============================================================*/
create table DynamicTimes
(
   DynamicID            int not null comment '����ID',
   FondTimes            int not null comment '��ϲ������',
   ReadTimes            int not null comment '���Ķ�����',
   ShareTimes           int not null comment '���������',
   CommentTimes         int not null comment '�����۴���',
   ReportTimes          int not null comment '���ٱ�����',
   CollectTimes         int not null comment '���ղش���',
   primary key (DynamicID)
)
type = MYISAM;

/*==============================================================*/
/* Table: Focus                                                 */
/*==============================================================*/
create table Focus
(
   FocusID              int not null auto_increment comment '������',
   UserID               int not null comment '��ע�û�ID',
   FocusUserID          int not null comment '����ע�û�ID',
   CreateTime           datetime not null comment '����ʱ��',
   primary key (FocusID)
)
type = MYISAM;

alter table Focus comment '��ע��';

/*==============================================================*/
/* Table: FondDynamic                                           */
/*==============================================================*/
create table FondDynamic
(
   FondID               int not null auto_increment comment '������ID',
   UserID               int not null comment '�û�ID(���Է�������)',
   FondDynamicID        int not null comment 'ϲ��������ID',
   CreateTime           datetime not null comment 'ע��ʱ��',
   primary key (FondID)
)
type = MYISAM;

/*==============================================================*/
/* Table: Notice                                                */
/*==============================================================*/
create table Notice
(
   NoticeID             int not null auto_increment comment '����������',
   UserID               int not null comment '�û�ID(���Է�������)',
   BeNoticeUserID       int not null comment '��֪ͨ�û�ID',
   NoticeType           int not null comment '֪ͨ����(1ϲ��2����3��ע4ϵͳ)',
   RelationID           int not null comment '�������������ID',
   CreateTime           datetime not null comment '���ʱ��',
   IsRead               int not null comment '�Ƿ񱻲鿴',
   primary key (NoticeID)
)
type = MYISAM;

/*==============================================================*/
/* Table: Report                                                */
/*==============================================================*/
create table Report
(
   ReportID             int not null auto_increment comment '�ٱ�ID',
   DynamicID            int not null comment '����ID',
   ReportReason         varchar(100) not null comment '�ٱ�ԭ��',
   ReporterID           int not null comment '�ٱ���ID',
   CreateTime           datetime not null comment 'ע��ʱ��',
   primary key (ReportID)
)
type = MYISAM;

/*==============================================================*/
/* Table: UserInfo                                              */
/*==============================================================*/
create table UserInfo
(
   UserID               int not null comment '�û�ID�����Է�������',
   NickName             varchar(20) not null comment '�ǳƣ�����������',
   Sex                  smallint not null comment '�Ա�',
   BirthDay             date not null comment '��������',
   CreateTime           datetime not null comment 'ע��ʱ��',
   HeadIconPath         varchar(100) not null comment 'ͷ��·��',
   PhoneNum             varchar(20) not null comment '�ֻ���',
   LogoutTime           date not null comment '�˳���¼ʱ��',
   Country              varchar(30) not null comment '����',
   Province             varchar(30) not null comment 'ʡ',
   City                 varchar(30) not null comment '��/����',
   Address              varchar(50) not null comment '�����ַ',
   Signature            varchar(200) not null comment '����ǩ��',
   primary key (UserID)
)
type = MYISAM;

alter table UserInfo comment '�û���';

/*==============================================================*/
/* Table: UserTimes                                             */
/*==============================================================*/
create table UserTimes
(
   UserID               int not null comment '�û�ID',
   ReadTimes            int not null comment '�û�������',
   PublishTimes         int not null comment '�û�������',
   primary key (UserID)
)
type = MYISAM;

alter table Collect add constraint "FK_User-Collect" foreign key (UserID)
      references UserInfo (UserID) on delete restrict on update restrict;

alter table Collect add constraint "FK_dynamic-collect" foreign key (DynamicID)
      references Dynamic (DynamicID) on delete restrict on update restrict;

alter table Comment add constraint "FK_Dynamic-Comment" foreign key (DynamicID)
      references Dynamic (DynamicID) on delete restrict on update restrict;

alter table Dynamic add constraint "FK_User-Dynamic" foreign key (UserID)
      references UserInfo (UserID) on delete restrict on update restrict;

alter table Focus add constraint "FK_User-Focus" foreign key (UserID)
      references UserInfo (UserID) on delete restrict on update restrict;

alter table FondDynamic add constraint "FK_user-fond" foreign key (UserID)
      references UserInfo (UserID) on delete restrict on update restrict;

alter table Notice add constraint FK_Relationship_8 foreign key (UserID)
      references UserInfo (UserID) on delete restrict on update restrict;

alter table Report add constraint "FK_Dynamic-Report" foreign key (DynamicID)
      references Dynamic (DynamicID) on delete restrict on update restrict;

