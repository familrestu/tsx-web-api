create table tclmuser (
	user_id serial primary key,
	user_name varchar(100) not null,
	password varchar(250) not null,
	is_reset integer not null default 0,
	created_date timestamp not null default now(),
	created_by varchar(100) not null default 'sys',
	modified_date timestamp null,
	modified_by varchar(100) null
);

create table teomemployee (
	employee_id serial primary key,
	user_id int not null,
	employee_no varchar(25) not null,
	first_name varchar(100) not null,
	middle_name varchar(100) null,
	last_name varchar(100) null,
	full_name varchar(300) not null,
	phone varchar(500) null,
	mobile_phone varchar(500) null,
	email varchar(100) not null,
	gender char not null,
	birth_date date not null,
	birth_place int null,
	identification_no varchar(25) not null,
	created_date timestamp not null default now(),
	created_by varchar(100) not null default 'sys',
	modified_date timestamp null,
	modified_by varchar(100) null
);