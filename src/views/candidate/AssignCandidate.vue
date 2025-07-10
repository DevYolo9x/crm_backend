<template>
  <div class="flex flex-col space-y-2.5">
    <nav class="flex text-gray-70" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <router-link :to="{ name: 'Dashboard' }" class="text-sm font-medium hover:text-blue-600">Tổng quan</router-link>
        </li>
        <li>
          <div class="flex items-center">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <router-link :to="{ name: 'jobs.index' }" class="text-sm font-medium hover:text-blue-600">Quản lý job order</router-link>
          </div>
        </li>
        <li v-if="job">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <router-link :to="{ name: 'jobs.update', params: { id: job.id } }" class="text-sm font-medium hover:text-blue-600">{{ job.job_title }}</router-link>
          </div>
        </li>
        <li>
          <div class="flex items-center">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">{{ route.meta.title }}</span>
          </div>
        </li>
      </ol>
    </nav>
    <Title v-if="job" :title="`Thêm ứng viên vào job order ${job.job_title}`" />
    <Loading :loading="loading" />
    <!-- Form gán ứng viên -->
    <div class="p-4 shadow-md">
      <h3 class="text-lg font-medium mb-4">Thêm mới ứng viên</h3>
      <form @submit.prevent="assignCandidate">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div class="col-span-5">
            <VueMultiselect v-model="form.candidate_id" :options="candidateOptions" label="name" track-by="id" placeholder="Tìm kiếm ứng viên" :searchable="true" :loading="isLoadingCandidates" :internal-search="false" @search-change="searchCandidates" @open="searchCandidates('')" />
          </div>
          <div class="col-span-2">
            <button type="submit" class="text-[14px] py-[7px] px-[10px] btn-success !w-auto flex items-center !h-[43px]">Gán ứng viên</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Danh sách ứng viên đã gán -->
    <div class="p-4 shadow-md">
      <h3 class="text-lg font-medium mb-4">Danh sách ứng viên</h3>
      <table class="w-full text-sm text-left">
        <thead class=" bg-[#e5e5e5]">
          <tr>
            <th class="px-4 py-2 font-medium">STT</th>
            <th class="px-4 py-2 font-medium">Ngày tạo</th>
            <th class="px-4 py-2 font-medium">Ứng viên</th>
            <th class="px-4 py-2 font-medium">Nhân viên phụ trách</th>
            <th class="px-4 py-2 font-medium">Trạng thái</th>
            <th class="px-4 py-2 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(candidateJob, key) in candidateJobs" :key="candidateJob.id" class="border-b hover:bg-gray-100">
            <td class="px-4 py-2">{{ key + 1 }}</td>
            <td class="px-4 py-2">{{ candidateJob.created_at }}</td>
            <td class="px-4 py-2" v-if="candidateJob.candidate">
              <span class="font-bold text-blue-600">{{ candidateJob.candidate.code }}</span>
              - {{ candidateJob.candidate.full_name }}
              <br />
              {{ candidateJob.candidate.phone }}
              <br />
              {{ candidateJob.candidate.email }}
              <br />
            </td>
            <td class="px-4 py-2">{{ `${candidateJob.user?.code}-${candidateJob.user?.name}` || '-' }}</td>
            <td class="px-4 py-2 w-80">
              <select v-model="candidateJob.status" @change="updateStatus(candidateJob.id, $event.target.value)" class="form-control">
                <option value="cv_upload">CV Upload</option>
                <option value="cv_sent_out">CV Sent Out</option>
                <option value="proceed_interview">Proceed Interview</option>
                <option value="fail_interview">Fail Interview</option>
                <option value="pass_interview">Pass Interview</option>
                <option value="offer_letter">Offer Letter</option>
              </select>
            </td>
            <td class="px-4 py-2 w-36">
              <div class="flex justify-end space-x-2">
                <button @click="showCandidate(candidateJob.candidate_id)" class="text-[14px] py-[7px] px-[10px] btn-warning !w-auto flex items-center">
                  <EyeIcon class="block h-5 w-5 text-white mr-1" />
                  Xem
                </button>
                <button @click="deleteCandidateJob(candidateJob.id)" class="text-[14px] py-[7px] px-[10px] btn-danger !w-auto flex items-center">
                  <XCircleIcon class="block h-5 w-5 text-white mr-1" />
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <CandidateDetail :candidateId="selectedCandidateId" :isVisible="isShowCandidate" @close="closeCandidateDetail" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import VueMultiselect from 'vue-multiselect'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import Swal from 'sweetalert2'
import axiosInstance from '../../axios'
import { debounce } from 'lodash'
import { XCircleIcon, EyeIcon } from '@heroicons/vue/solid'

import CandidateDetail from '../../components/candidate/CandidateDetail.vue'
const isShowCandidate = ref(false)
const selectedCandidateId = ref(null)
const showCandidate = (id) => {
  selectedCandidateId.value = id
  isShowCandidate.value = true
}
const closeCandidateDetail = () => {
  isShowCandidate.value = false
  selectedCandidateId.value = null
}
const store = useStore()
const route = useRoute()
const loading = ref(false)
const form = ref({
  candidate_id: null,
})
const candidateOptions = ref([])
const isLoadingCandidates = ref(false)
const candidateJobs = ref(null)
const job = ref(null)
const searchCandidates = debounce(async (query) => {
  try {
    const { data } = await axiosInstance.get('/candidates/search', {
      params: { keyword: query },
    })
    candidateOptions.value = data.candidates
  } catch (error) {
    console.error('Error searching candidates:', error)
  }
}, 300)

const fetchJob = async () => {
  try {
    const data = await store.dispatch('jobs/fetchShowJob', route.params.id)
    job.value = data.job
  } catch (error) {
    console.error(error)
  }
}

const fetchCandidateJobs = async () => {
  loading.value = true
  try {
    const payload = {
      job_id: route.params.id,
    }
    const data = await store.dispatch('candidateJobs/fetchCandidateJobs', payload)
    console.log(data.lists)
    candidateJobs.value = data.lists
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const assignCandidate = async () => {
  loading.value = true
  try {
    const payload = {
      candidate_id: form.value.candidate_id?.id,
      job_id: job.value.id,
    }
    const response = await store.dispatch('candidateJobs/assignCandidateToJob', payload)
    Swal.fire('Thành công!', response.message, 'success')
    form.value = { candidate_id: null }
    await fetchCandidateJobs() // Cập nhật danh sách sau khi gán
  } catch (error) {
    const errorMessage = error.error === 'duplicate_assignment' ? 'Ứng viên này đã được gán vào job order này trước đó!' : error.message || 'Có lỗi xảy ra!'
    Swal.fire('Lỗi!', errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id, status) => {
  loading.value = true
  try {
    const response = await store.dispatch('candidateJobs/updateCandidateJobStatus', { id, status })
    Swal.fire('Thành công!', response.message, 'success')
  } catch (error) {
    Swal.fire('Lỗi!', error.message || 'Có lỗi xảy ra!', 'error')
  } finally {
    loading.value = false
  }
}

const deleteCandidateJob = async (id) => {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa?',
    text: 'Hành động này không thể hoàn tác!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy',
  })
  if (result.isConfirmed) {
    loading.value = true
    try {
      await store.dispatch('candidateJobs/deleteCandidateJob', id)
      Swal.fire('Thành công!', 'Ứng viên đã được xóa khỏi job order!', 'success')
      await fetchCandidateJobs() // Cập nhật danh sách sau khi xóa
    } catch (error) {
      Swal.fire('Lỗi!', error.message || 'Có lỗi xảy ra!', 'error')
    } finally {
      loading.value = false
    }
  }
}

const loadData = async () => {
  await fetchJob()
  await fetchCandidateJobs()
}
onMounted(async () => {
  await Promise.all([loadData(), store.dispatch('candidates/fetchProvinces'), store.dispatch('candidates/fetchConfigCandidate')])
})
</script>
