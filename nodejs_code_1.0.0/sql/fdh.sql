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
   ID                   int not null auto_increment comment '自增长ID(主键)',
   UserID               int not null comment '收藏者ID',
   DynamicID            int not null comment '帖子ID',
   CollectTime          datetime not null comment '收藏的时间',
   primary key (ID)
)
type = MYISAM;

alter table Collect comment '收藏表';

/*==============================================================*/
/* Table: Comment                                               */
/*==============================================================*/
create table Comment
(
   CommentID            int not null auto_increment comment '评论ID',
   DynamicID            int not null comment '帖子ID',
   CommentUserID        int not null comment '评论用户ID',
   CommentName          varchar(20) not null,
   CommentContent       varchar(200) not null comment '评论内容',
   CommentTime          datetime not null comment '评论时间',
   BeCommentUserID      int not null comment '被评论的用户ID',
   BeCommentName        varchar(20) not null,
   BeCommentID          int not null,
   BelongCommentID      int not null comment '归属于哪条评论',
   primary key (CommentID)
)
type = MYISAM;

alter table Comment comment '评论表';

/*==============================================================*/
/* Table: Dynamic                                               */
/*==============================================================*/
create table Dynamic
(
   DynamicID            int not null auto_increment comment '帖子ID',
   UserID               int not null comment '用户ID',
   HeadIconPath         varchar(100) not null comment '头像路径',
   NickName             varchar(20) not null comment '昵称',
   Content              varchar(2000) not null comment '内容',
   CreateTime           datetime not null comment '发帖时间',
   Location             varchar(100) not null comment '发帖位置',
   PicturePath          varchar(900) not null comment '帖子图像存放路径',
   Longitude            double not null comment '经度',
   Latitude             double not null comment '纬度',
   ReadTimes            int not null comment '阅读次数',
   FondTimes            int not null comment '喜欢次数',
   ShareTimes           int not null comment '分享次数',
   primary key (DynamicID)
)
type = InnoDB;

alter table Dynamic comment '帖子的表结构';

/*==============================================================*/
/* Table: DynamicTimes                                          */
/*==============================================================*/
create table DynamicTimes
(
   DynamicID            int not null comment '帖子ID',
   FondTimes            int not null comment '被喜欢次数',
   ReadTimes            int not null comment '被阅读次数',
   ShareTimes           int not null comment '被分享次数',
   CommentTimes         int not null comment '被评论次数',
   ReportTimes          int not null comment '被举报次数',
   CollectTimes         int not null comment '被收藏次数',
   primary key (DynamicID)
)
type = MYISAM;

/*==============================================================*/
/* Table: Focus                                                 */
/*==============================================================*/
create table Focus
(
   FocusID              int not null auto_increment comment '自增长',
   UserID               int not null comment '关注用户ID',
   FocusUserID          int not null comment '被关注用户ID',
   CreateTime           datetime not null comment '创建时间',
   primary key (FocusID)
)
type = MYISAM;

alter table Focus comment '关注表';

/*==============================================================*/
/* Table: FondDynamic                                           */
/*==============================================================*/
create table FondDynamic
(
   FondID               int not null auto_increment comment '自增长ID',
   UserID               int not null comment '用户ID(来自房东利器)',
   FondDynamicID        int not null comment '喜欢的帖子ID',
   CreateTime           datetime not null comment '注册时间',
   primary key (FondID)
)
type = MYISAM;

/*==============================================================*/
/* Table: Notice                                                */
/*==============================================================*/
create table Notice
(
   NoticeID             int not null auto_increment comment '自增长主键',
   UserID               int not null comment '用户ID(来自房东利器)',
   BeNoticeUserID       int not null comment '被通知用户ID',
   NoticeType           int not null comment '通知类型(1喜欢2评论3关注4系统)',
   RelationID           int not null comment '关联的其它表的ID',
   CreateTime           datetime not null comment '添加时间',
   IsRead               int not null comment '是否被查看',
   primary key (NoticeID)
)
type = MYISAM;

/*==============================================================*/
/* Table: Report                                                */
/*==============================================================*/
create table Report
(
   ReportID             int not null auto_increment comment '举报ID',
   DynamicID            int not null comment '帖子ID',
   ReportReason         varchar(100) not null comment '举报原因',
   ReporterID           int not null comment '举报者ID',
   CreateTime           datetime not null comment '注册时间',
   primary key (ReportID)
)
type = MYISAM;

/*==============================================================*/
/* Table: UserInfo                                              */
/*==============================================================*/
create table UserInfo
(
   UserID               int not null comment '用户ID，来自房东利器',
   NickName             varchar(20) not null comment '昵称（房东利器）',
   Sex                  smallint not null comment '性别',
   BirthDay             date not null comment '出生年月',
   CreateTime           datetime not null comment '注册时间',
   HeadIconPath         varchar(100) not null comment '头像路径',
   PhoneNum             varchar(20) not null comment '手机号',
   LogoutTime           date not null comment '退出登录时间',
   Country              varchar(30) not null comment '国家',
   Province             varchar(30) not null comment '省',
   City                 varchar(30) not null comment '市/地区',
   Address              varchar(50) not null comment '具体地址',
   Signature            varchar(200) not null comment '个性签名',
   primary key (UserID)
)
type = MYISAM;

alter table UserInfo comment '用户表';

/*==============================================================*/
/* Table: UserTimes                                             */
/*==============================================================*/
create table UserTimes
(
   UserID               int not null comment '用户ID',
   ReadTimes            int not null comment '用户读帖数',
   PublishTimes         int not null comment '用户发帖数',
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

