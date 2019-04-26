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

  static get_doctors({
    limit = 20,
    offset = 0,
    specialtyId,
    code,
    name
  }) {
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

    return new Promise((resolve, reject) => {
      redis.get(`speciality_list`, async (err, specialities) => {
        if (specialities) {
          return resolve(JSON.parse(specialities))
        } else {
          let model = new Doctor()
          let res = await request({
            method: 'GET',
            json: true,
            uri: `${model.API_URL}/Rubika/Doctors/MedicalSpecialties`
          })
          redis.set(`speciality_list`, JSON.stringify(res.result.medicalSpecialties))
          return resolve(res.result.medicalSpecialties)
        }
      })
    })
  }
  static get_time_price(id, phone) {
    let model = new Doctor()
    return request({
      method: 'GET',
      json: true,
      uri: `${model.API_URL}/Rubika/Doctors/${id}/communicationquote?patientphonenumber=${phone}`
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
  static request_test_answer(id, phone) {
    return new Promise((resolve, reject) => {

      let model = new Doctor()
      return request({
        method: 'GET',
        json: true,
        uri: `${model.API_URL}/Rubika/Doctors/${id}/requestTestAnswer?patientphonenumber=${phone}`
      }).then(res => {
        resolve(res)
      }).catch(err => {

        if (id == 7580) {
          return resolve({
            status: 'needMoney',
            user_charge: 8000,
            request_price: 15000
          })
        }
        resolve({
          status: 'ok',
          user_charge: 8000,
          request_price: 15000
        })
      })
    })
  }
}

module.exports = Doctor;