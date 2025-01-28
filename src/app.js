const Database = require('better-sqlite3');

DB_PATH='путь_до_базы_данных'

const db = new Database(DB_PATH);

const objsDevices = db.prepare('SELECT * from objs WHERE HEX(obj) LIKE ?').all('4D320100FF8801000F%');
const objsDeviceTypes = db.prepare('SELECT * from objs WHERE HEX(obj) LIKE ?').all('4D320100FF8801000E%');

const fieldsHead = [ 0x10, 0xfe, 0xff ];

const fields = {
    '1000fe': 'name',
    '401f10': 'ip_addresses',
    '441f10': 'mac_address',
    '4c1f10': 'device_type_id',
    '0100fe': 'record_id', // link id ??
    //'411f10': 'dns_names',
    //'431f10': 'dns_lookup_interval',
    //'461f10': 'username',
    //'471f10': 'password',
    //'4a1f10': 'router_os',
    //'571f10': 'parents_id',
    //'581f10': 'custom_field_1',
    //'591f10': 'custom_field_2',
    //'5a1f10': 'custom_field_3',
    //'4e1f10': 'snmp_profile_id', // 0xffffff is default
    //'491f10': 'secure_mode',
    //'4b1f10': 'dude_server',
    //'421f10': 'dns_lookup',
    //'451f10': 'mac_lookup',
    //'511f10': 'polling',
    //'551f10': 'use_notifications',
    //'561f10': 'notifications_id',
    //'4d1f10': 'agent_id', // 0x00 is server
    //'521f10': 'probe_interval',
    //'531f10': 'probe_timeout',
    //'541f10': 'probe_down_count'
};

const types = [
    0x21, // Короткая строка
    0x31, // Массив байтов (MAC адрес)
    0x08, // Стандартное число (int)
    0x10, // Большое число (long int)
    0x18, // Чсло 128bit
    0x09, // Байт (byte)
    //0x29, // M2 блок
    //0xa8, // Массив блоков M2
    0x88, // Массив чисел
    0xa0, // Массив строк
    0x00, // Булево
    0x01  // Булево
];

function decode(data, id) {

    const result = {};

    for (let idx = 0; idx < data.length; idx++) {
        if (fieldsHead.includes(data[idx])) {
            idx++;
            const checkField = Array.from(data.slice(idx - 3, idx)).
                map(byte => byte.toString(16).padStart(2, '0')).join('');

            let type = data[idx]
            let field = fields[checkField];
            if (!field) { continue; }
            result[field] = null;
            if (!types.includes(type)) { continue; }
            idx++
            let size = 0x00;
            switch (type) {
                case 0x88:
                case 0xa0:
                    result[field] = [];
                    size = data.readUInt16LE(idx); idx += 2;
                    for (let aid = 0; aid < size; aid++) {
                        if (type === 0x88) {
                            if (field === 'ip_addresses') {
                                result[field].push(data.slice(idx, idx + 4).map(byte => byte.toString(10)).join('.')); idx += 4;
                            } else {
                                result[field].push(data.readUInt32LE(idx)); idx += 4;
                            }
                        } else {
                            const subsize = data.readUInt16LE(idx);  idx += 2;
                            if (subsize > 0) {
                                result[field].push(data.slice(idx, idx + subsize).toString('utf8')); idx += subsize;
                            }
                        }
                    }
                    break;
                case 0x31:
                case 0x21:
                    size = data[idx]; idx++;
                    if (size > 0) {
                        if (type === 0x31) {
                            result[field] = [];
                            const mac_count = size/6;
                            for (let mac_num = 0; mac_num < mac_count; mac_num++) {
                                result[field].push(Array.from(data.slice(idx + (6 * mac_num), (6 + idx) + (6 * mac_num))).map(byte => byte.toString(16).padStart(2, '0')).join(':'));
                            }
                        } else {
                            result[field] = data.slice(idx, idx + size).toString('utf8');
                        }
                        idx += size;
                    }
                    break;
                case 0x09:
                    result[field] =  data[idx];
                    break;
                case 0x08:
                    result[field] = data.readUInt16LE(idx); idx += 4;
                    break;
                case 0x10:
                    result[field] = data.readUInt32LE(idx); idx += 8;
                    break;
                case 0x18:
                    // Скип
                    idx += 16;
                    break
                case 0x00:
                case 0x01:
                    result[field] =  type ? true : false;
                    break;
                default:
                    break;
            }
        }
    }
    return result;
}

const devTypes = {};
const allDevices = {};

// Обработка типов устройств

for (const obj in objsDeviceTypes){
    const  pretty = decode(objsDeviceTypes[obj].obj.slice(8), objsDeviceTypes[obj].id);
    pretty['obj_id'] = objsDeviceTypes[obj].id;
    devTypes[pretty['record_id']] = pretty;

}

// Обработка устройств

for (const obj in objsDevices){
    const  pretty = decode(objsDevices[obj].obj.slice(8), objsDevices[obj].id);
    pretty['device_type_id'] = devTypes[pretty['device_type_id']];
    allDevices[objsDevices[obj].id] = pretty;
}

console.log(allDevices);
