# The Dude DB Extractor - Node.js

Начиная с версии 6.34, The Dude (серверная часть) переехал с Windows, на Router OS (Mikrotik).
Формат хранения данных также перетерпел изменения, вместо базы в виде XML файла, отныне всё хранится в SQLite3 DB.
Грусть и печаль заключается в том, что данные в базе хранятся в бинарном виде, и естественно совершенно нечитаемы.

Данный проект предназначен для декодирования бинарных данных (Устройства и их типы) с переводом оных в читаемый формат.

## Установка
1. У вас должен быть установлен `Node.js`
2. Клонируйте репозиторий: `git clone https://github.com/techedge-su/the-dude-db-extractor.git`
3. Перейдите в директорию проекта, и установите зависимости: `npm install`

## Использование
1. Отредактируйте файл `src/app.js`, укажите путь до базы данных sqlite3 в константе `DB_PATH`
2. При необходимости, раскомментируйте строки в объекте `fields`, для добавления их в общий вывод
3. Запустите скрипт: `npm start`

## Пример результата выполнения

```
{
  '21007114': {
    ip_addresses: [ 'xxx.xxx.xxx.xxx' ],
    device_type_id: { record_id: 10243, name: 'Имя типа', obj_id: 10243 },
    record_id: 35594,
    mac_address: [ 'xx:xx:xx:xx:xx:xx' ],
    name: 'Имя устройства'
  }
}
```
Доступные поля для добавления в общий вывод:

```
name
ip_addresses
mac_address
device_type_id
record_id
dns_names
dns_lookup_interval
username
password
router_os
parents_id
custom_field_1
custom_field_2
custom_field_3
snmp_profile_id
secure_mode
dude_server
dns_lookup
mac_lookup
polling
use_notifications
notifications_id
agent_id
probe_interval
probe_timeout
probe_down_count
```
## Лицензия
Этот проект распространяется под лицензией MIT.
