import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { fetchWithAuth } from '../utils/authFetch';
import { toast } from 'react-toastify';
import { links } from '../contstants';
import { useDebounce } from './useDebounce';

export function useProjects(initialPage = 1, perPage = 15) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ 
    current_page: initialPage, 
    total_page: 1, 
    per_page: perPage, 
    total_records: 0 
  });
  const [search, setSearch] = useState("");
  const debSearch = useDebounce(search, 600);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchWithAuth(`${links.BASE_URL}projects`, { 
        method: "GET", 
        params: { 
          page: pagination.current_page, 
          limit: pagination.per_page, 
          search: debSearch 
        } 
      });
      setProjects(r?.data?.data?.projects || []);
      setPagination((p) => ({ ...p, ...r?.data?.data }));
    } catch { 
      toast.error("Failed to load projects"); 
    }
    setLoading(false);
  }, [pagination.current_page, pagination.per_page, debSearch]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    pagination,
    setPagination,
    search,
    setSearch,
    reload: loadProjects
  };
}