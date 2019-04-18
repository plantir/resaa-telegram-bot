// const dbConf = require('../config/db.config');
// const redis = dbConf.redis;
const request = require('request-promise')
const bot_token =
  'DG0RIQVKTTKCUEUGURNGOHBLWULTSSQFHISIFXGXDACBMGZFWKDWNBLZKQLFSJDY'
const dbConf = require('../config/db.config')
const redis = dbConf.redis
class Doctor {
  constructor() {
    this.API_URL = process.env.NODE_ENV === 'development' ? 'https://webapi.resaa.net' : 'http://resa-web-api.bsn.local';
    this.fields = 'subscriberNumber,firstName,lastName,currentlyAvailable'
  }

  static get_doctors({ limit = 20, offset = 0, specialtyId, code, name }) {
    let model = new Doctor()
    let uri = `${model.API_URL}/Doctors?fields=${
      model.fields
      }&limit=${limit}&offset=${offset}`
    if (specialtyId) {
      uri += `&specialtyId=${specialtyId}`
    }
    if (code) {
      uri += `&code=${code}`
    }
    if (name) {
      uri += `&name=${name}`
    }
    return request({
      method: 'GET',
      json: true,
      uri: encodeURI(uri)
    })
  }
  static find(id) {
    let model = new Doctor()
    let uri = `${
      model.API_URL
      }/Doctors/${id}?fields=id,firstName,lastName,currentlyAvailable,subscriberNumber,specialty,tags,expertise,timetable,title,workplaces&clientTimeZoneOffset=-210`
    return request({
      method: 'GET',
      json: true,
      uri: uri
    })
  }
  static get_speciality_list() {
    let model = new Doctor()
    return request({
      method: 'GET',
      json: true,
      uri: `${model.API_URL}/Rubika/Doctors/MedicalSpecialties`
    })
  }
  static get_time_price(id) {
    let model = new Doctor()
    return request({
      method: 'GET',
      json: true,
      uri: `${model.API_URL}/Rubika/Doctors/${id}/communicationquote`
    })
  }
  static image_id(doctor_id) {
    let model = new Doctor()
    return new Promise((resolve, reject) => {
      redis.get(`doctor_${doctor_id}_image`, (err, file_id) => {
        if (file_id) {
          return resolve(file_id)
        } else {
          request
            .get(`${model.API_URL}/doctors/${doctor_id}/Image`, {
              encoding: null
            })
            .then(image => {
              return resolve(image)
            })
            .catch(err => {
              reject(err)
            })
        }
      })
    })
  }
  static saveImage(doctor_id, response) {
    redis.set(`doctor_${doctor_id}_image`, response.photo[1].file_id)
  }
}

module.exports = Doctor
